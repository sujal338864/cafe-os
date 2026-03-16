import { Router } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/auth';

const router = Router();

// Public menu endpoint - no auth required
router.get('/', asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    include: { category: { select: { name: true } } },
    orderBy: { category: { name: 'asc' } },
  });
  return res.json({ products });
}));

// Public order creation - no auth required
router.post('/order', asyncHandler(async (req, res) => {
  const { customerName, customerPhone, tableNumber, notes, paymentMethod, items } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'No items' });

  const shop = await prisma.shop.findFirst();
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let subtotal = 0;
  const orderItems = items.map((i: any) => {
    const p = products.find((x: any) => x.id === i.productId);
    if (!p) throw new Error('Product not found: ' + i.productId);
    const amount = Number(p.sellingPrice) * i.quantity;
    subtotal += amount;
    return { productId: p.id, name: p.name, quantity: i.quantity, unitPrice: p.sellingPrice, costPrice: p.costPrice || 0, taxRate: p.taxRate || 0, discount: 0, totalPrice: amount };
  });

  const tax = orderItems.reduce((s: number, i: any) => s + i.totalPrice * (i.taxRate / 100), 0);
  const total = subtotal + tax;
  const invoice = 'ORD-' + Date.now();

  const order = await prisma.order.create({
    data: {
      shopId: shop.id,
      invoiceNumber: invoice,
      customerName: customerName || 'Walk-in',
      customerPhone: customerPhone || null,
      tableNumber: tableNumber || null,
      notes: notes || null,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      subtotal,
      taxAmount: tax,
      discountAmount: 0,
      totalAmount: total,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return res.status(201).json({ order, invoiceNumber: invoice });
}));

export default router;
