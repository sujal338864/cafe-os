import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, asyncHandler, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/shop/profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shopId }
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(shop);
  })
);

/**
 * PUT /api/shop/profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const shop = await prisma.shop.update({
      where: { id: req.user!.shopId },
      data: req.body
    });

    res.json(shop);
  })
);

export default router;
