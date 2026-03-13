// PASTE THIS INTO: C:\Users\Lenovo\Downloads\files\backend\src\routes\analytics.ts
// Fixes: too many parallel Prisma queries causing connection pool timeout

import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, asyncHandler, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const shopId = req.user!.shopId;

  // Run sequentially to avoid connection pool exhaustion on Supabase
  const totalOrders    = await prisma.order.count({ where: { shopId, status: 'COMPLETED' } });
  const revenueAgg     = await prisma.order.aggregate({ where: { shopId, status: 'COMPLETED' }, _sum: { totalAmount: true } });
  const totalCustomers = await prisma.customer.count({ where: { shopId } });
  const totalProducts  = await prisma.product.count({ where: { shopId } });
  const lowStockItems  = await prisma.product.count({ where: { shopId, stock: { lte: prisma.product.fields.lowStockAlert } } }).catch(() => 0);

  const totalRevenue  = Number(revenueAgg._sum.totalAmount || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Monthly sales - last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentOrders = await prisma.order.findMany({
    where: { shopId, status: 'COMPLETED', createdAt: { gte: sixMonthsAgo } },
    select: { totalAmount: true, createdAt: true }
  });

  // Build monthly chart data
  const monthMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('default', { month: 'short' });
    monthMap[key] = { revenue: 0, orders: 0 };
  }
  for (const o of recentOrders) {
    const key = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
    if (monthMap[key]) {
      monthMap[key].revenue += Number(o.totalAmount);
      monthMap[key].orders  += 1;
    }
  }
  const monthlySales = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  // Top products
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { shopId, status: 'COMPLETED' } },
    select: { name: true, quantity: true, unitPrice: true }
  });
  const productMap: Record<string, { name: string; revenue: number; quantity: number }> = {};
  for (const item of orderItems) {
    if (!productMap[item.name]) productMap[item.name] = { name: item.name, revenue: 0, quantity: 0 };
    productMap[item.name].revenue  += Number(item.unitPrice) * item.quantity;
    productMap[item.name].quantity += item.quantity;
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Category breakdown
  const categories = await prisma.category.findMany({
    where: { shopId },
    select: { name: true, products: { select: { orderItems: { select: { unitPrice: true, quantity: true } } } } }
  });
  const categoryBreakdown = categories
    .map(c => ({
      name: c.name,
      revenue: c.products.reduce((s, p) => s + p.orderItems.reduce((ss, oi) => ss + Number(oi.unitPrice) * oi.quantity, 0), 0)
    }))
    .filter(c => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  res.json({
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalCustomers,
    totalProducts,
    lowStockItems,
    monthlySales,
    topProducts,
    categoryBreakdown,
  });
}));

// Recent activity
router.get('/recent', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const shopId = req.user!.shopId;
  const orders = await prisma.order.findMany({
    where: { shopId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { customer: true, items: true }
  });
  res.json({ orders });
}));

export default router;