import { Router } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/auth';
import { PaymentMethod } from '@prisma/client';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
  });
  return res.json({ products });
}));

router.post('/order', asyncHandler(async (req, res) => {
  const { customerName, customerPhone, tableNumber, notes, paymentMethod, items } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'No items' });

  const shop = await prisma.shop.findFirst({ include: { users: { take: 1 } } });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  const userId = shop.users[0]?.id;
  if (!userId) return res.status(404).json({ error: 'No user found' });

  // Find or create customer by phone
  let customerId: string | null = null;
  if (customerPhone) {
    let cust = await prisma.customer.findFirst({ where: { shopId: shop.id, phone: customerPhone } });
    if (!cust) cust = await prisma.customer.create({ data: { shopId: shop.id, name: customerName || 'Walk-in', phone: customerPhone } });
    customerId = cust.id;
  }

  const productIds = items.map((i: any) => i.productId);
  const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let subtotal = 0;
  const orderItems = items.map((i: any) => {
    const p = dbProducts.find((x: any) => x.id === i.productId);
    if (!p) throw new Error('Product not found: ' + i.productId);
    const amount = Number(p.sellingPrice) * i.quantity;
    subtotal += amount;
    return { productId: p.id, name: p.name, quantity: i.quantity, unitPrice: p.sellingPrice, costPrice: p.costPrice || 0, taxRate: p.taxRate || 0, discount: 0, total: amount };
  });

  const taxAmount = orderItems.reduce((s: number, i: any) => s + i.total * (i.taxRate / 100), 0);
  const totalAmount = subtotal + taxAmount;
  const count = await prisma.order.count({ where: { shopId: shop.id } });
  const invoiceNumber = 'ONL-' + String(count + 1).padStart(6, '0');
  const pm = (paymentMethod as PaymentMethod) || PaymentMethod.CASH;

  const order = await prisma.order.create({
    data: {
      shopId: shop.id,
      userId,
      customerId,
      invoiceNumber,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      paymentMethod: pm,
      paymentStatus: 'UNPAID',
      status: 'COMPLETED',
      notes: (tableNumber ? 'Table: ' + tableNumber + '. ' : '') + (notes || ''),
      items: { create: orderItems },
    },
    include: { items: true },
  });

  // Deduct stock
  for (const item of items) {
    await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
  }

  return res.status(201).json({ order, invoiceNumber });
}));

export default router;
