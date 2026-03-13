import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, asyncHandler, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/subscriptions/plans
 */
router.get(
  '/plans',
  asyncHandler(async (req, res) => {
    const plans = [
      {
        id: 'STARTER',
        name: 'Starter',
        price: 499,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'Up to 100 products',
          'Basic POS',
          'Customer management',
          'Basic analytics',
          'Email support'
        ]
      },
      {
        id: 'PRO',
        name: 'Pro',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'Unlimited products',
          'Advanced POS',
          'Full customer management',
          'Advanced analytics',
          'AI insights',
          'Priority support'
        ]
      },
      {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 2999,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'Everything in Pro',
          'Multi-location support',
          'Custom integrations',
          'Dedicated account manager',
          'API access',
          '24/7 phone support'
        ]
      }
    ];

    res.json(plans);
  })
);

/**
 * POST /api/subscriptions/create-checkout
 */
router.post(
  '/create-checkout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { plan, billingCycle = 'monthly' } = req.body;

    // TODO: Integrate with Stripe/Razorpay
    res.json({
      message: 'Payment integration coming soon',
      plan,
      billingCycle
    });
  })
);

/**
 * GET /api/subscriptions/current
 */
router.get(
  '/current',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = await prisma.subscription.findFirst({
      where: {
        shopId: req.user!.shopId,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    res.json(subscription);
  })
);

export default router;
