import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, authorize, asyncHandler, validateRequest, AuthRequest } from '../middleware/auth';

const router = Router();

const orderSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().int().positive(),
    costPrice: z.number(),
    unitPrice: z.number().positive(),
    taxRate: z.number().min(0).max(100).default(0),
    discount: z.number().min(0).default(0)
  })).min(1, 'At least one item is required'),
  discountAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT']),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']).default('PAID'),
  notes: z.string().optional()
});

router.post(
  '/',
  authenticate,
  validateRequest(orderSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { customerId, items, discountAmount = 0, paymentMethod, paymentStatus, notes } = req.body;

    let subtotal = 0;
    let taxAmount = 0;
    for (const item of items) {
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;
      taxAmount += itemSubtotal * (item.taxRate / 100);
    }
    const totalAmount = subtotal + taxAmount - discountAmount;

    const count = await prisma.order.count({ where: { shopId: req.user!.shopId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

    // ✅ Transaction ONLY does the critical DB writes - no extra reads
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          shopId: req.user!.shopId,
          userId: req.user!.id,
          customerId: customerId || null,
          invoiceNumber,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paidAmount: paymentStatus === 'PAID' ? totalAmount : 0,
          paymentMethod,
          paymentStatus,
          status: 'COMPLETED',
          notes,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              costPrice: item.costPrice,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || 0,
              discount: item.discount || 0,
              total: item.unitPrice * item.quantity
            }))
          }
        },
        include: { items: true, customer: true, user: { select: { name: true } } }
      });

      // Deduct stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        await tx.stockHistory.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            note: `Sale: ${invoiceNumber}`
          }
        });
      }

      // Update customer
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalPurchases: { increment: totalAmount },
            ...(paymentMethod === 'CREDIT' && { outstandingBalance: { increment: totalAmount } })
          }
        });
      }

      return newOrder;
    }, { timeout: 15000 }); // ✅ 15 second timeout

    // ✅ Low stock notifications OUTSIDE transaction (non-critical)
    try {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock <= product.lowStockAlert) {
          await prisma.notification.create({
            data: {
              shopId: req.user!.shopId,
              type: 'LOW_STOCK',
              title: 'Low Stock Alert',
              message: `${product.name} is running low (${product.stock} left)`,
              metadata: { productId: product.id }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Low stock notification failed (non-critical):', e);
    }

    res.status(201).json(order);
  })
);

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { page = '1', limit = '20', startDate, endDate, customerId, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      shopId: req.user!.shopId,
      ...(startDate && endDate && { createdAt: { gte: new Date(startDate as string), lte: new Date(endDate as string) } }),
      ...(customerId && { customerId: customerId as string }),
      ...(status && { status: status as string })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limitNum,
        include: { customer: true, items: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId },
      include: { customer: true, items: true, user: { select: { name: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  })
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'CANCELLED') return res.status(400).json({ error: 'Order is already cancelled' });

    const updated = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' },
        include: { items: true }
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
        await tx.stockHistory.create({
          data: { productId: item.productId, type: 'RETURN', quantity: item.quantity, note: `Cancelled: ${order.invoiceNumber}` }
        });
      }
      return cancelledOrder;
    }, { timeout: 15000 });

    res.json(updated);
  })
);

export default router;
