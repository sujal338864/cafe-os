import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../index';
import { asyncHandler, validateRequest } from '../middleware/auth';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── VALIDATION SCHEMAS ──────────────────────────────────────
const registerSchema = z.object({
  shopName:  z.string().min(2),
  ownerName: z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(8),
  phone:     z.string().min(10),
  gstNumber: z.string().optional(),
  address:   z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1),    // Google ID token from frontend
  shopName:   z.string().min(2).optional(), // only needed on first login (registration)
  phone:      z.string().min(10).optional(),
});

// ─── HELPERS ────────────────────────────────────────────────
function makeToken(userId: string, shopId: string, role: string, email: string) {
  return jwt.sign(
    { id: userId, shopId, role, email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

function userResponse(user: any, shop: any, token: string) {
  return {
    token,
    user:  { id: user.id, name: user.name, email: user.email, role: user.role },
    shop:  { id: shop.id, name: shop.name, plan: shop.plan },
  };
}

// ─── POST /api/auth/register ─────────────────────────────────
router.post('/register', validateRequest(registerSchema), asyncHandler(async (req, res) => {
  const { shopName, ownerName, email, password, phone, gstNumber, address } = req.body;

  const existing = await prisma.shop.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);

  const shop = await prisma.$transaction(async (tx) => {
    const s = await tx.shop.create({
      data: {
        name: shopName, ownerName, email, phone, gstNumber, address,
        currency: 'INR', timezone: 'Asia/Kolkata', plan: 'STARTER', isActive: true,
        users: {
          create: { name: ownerName, email, passwordHash, role: 'ADMIN', isEmailVerified: true }
        }
      },
      include: { users: true }
    });
    await tx.notification.create({
      data: {
        shopId: s.id, type: 'SYSTEM', title: 'Welcome to Shop OS',
        message: 'Your shop was created. Start by adding products to your inventory.',
      }
    });
    return s;
  });

  const token = makeToken(shop.users[0].id, shop.id, shop.users[0].role, shop.users[0].email);
  return res.status(201).json(userResponse(shop.users[0], shop, token));
}));

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', validateRequest(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email },
    include: { shop: true }
  });

  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  if (!user.isActive)    return res.status(403).json({ error: 'User account is inactive' });
  if (!user.shop.isActive) return res.status(403).json({ error: 'Shop account is inactive' });

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = makeToken(user.id, user.shopId, user.role, user.email);
  return res.json(userResponse(user, user.shop, token));
}));

// ─── POST /api/auth/google ───────────────────────────────────
// Works for BOTH sign-in (existing user) and sign-up (new shop).
// Flow:
//   1. Frontend gets Google credential (ID token) via Google Sign-In button
//   2. Sends it here
//   3. If user exists → log them in
//   4. If new → create shop + user (shopName & phone required)
router.post('/google', validateRequest(googleAuthSchema), asyncHandler(async (req, res) => {
  const { credential, shopName, phone } = req.body;

  // Verify Google token
  let payload: any;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const { email, name, sub: googleId, picture } = payload;
  if (!email) return res.status(400).json({ error: 'Google account has no email' });

  // Check if user already exists (any shop with this google email)
  const existingUser = await prisma.user.findFirst({
    where: { email },
    include: { shop: true }
  });

  if (existingUser) {
    // Existing user — just log them in
    if (!existingUser.isActive)      return res.status(403).json({ error: 'User inactive' });
    if (!existingUser.shop.isActive) return res.status(403).json({ error: 'Shop inactive' });

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { lastLogin: new Date(), isEmailVerified: true }
    });

    const token = makeToken(existingUser.id, existingUser.shopId, existingUser.role, existingUser.email);
    return res.json({
      ...userResponse(existingUser, existingUser.shop, token),
      isNewUser: false,
    });
  }

  // New user — need shopName + phone to create shop
  if (!shopName || !phone) {
    // Tell frontend this is a new user so it shows the registration form
    return res.status(200).json({
      isNewUser: true,
      email,
      name,
      googleId,
      picture,
    });
  }

  // Create new shop + user
  const shop = await prisma.$transaction(async (tx) => {
    const s = await tx.shop.create({
      data: {
        name: shopName,
        ownerName: name || email.split('@')[0],
        email,
        phone,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        plan: 'STARTER',
        isActive: true,
        users: {
          create: {
            name:             name || email.split('@')[0],
            email,
            passwordHash:     '', // No password for Google users
            role:             'ADMIN',
            isEmailVerified:  true,
          }
        }
      },
      include: { users: true }
    });
    await tx.notification.create({
      data: {
        shopId: s.id, type: 'SYSTEM', title: 'Welcome to Shop OS',
        message: 'Your shop was created via Google. Start by adding products.',
      }
    });
    return s;
  });

  const token = makeToken(shop.users[0].id, shop.id, shop.users[0].role, shop.users[0].email);
  return res.status(201).json({
    ...userResponse(shop.users[0], shop, token),
    isNewUser: true,
  });
}));

// ─── POST /api/auth/forgot-password ─────────────────────────
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.json({ message: 'If email exists, reset link will be sent' });

  const resetToken = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetExpiry: new Date(Date.now() + 3600000) }
  });

  // TODO: send email — const link = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return res.json({ message: 'Password reset link sent to email' });
}));

// ─── POST /api/auth/reset-password ──────────────────────────
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.resetToken !== token) return res.status(400).json({ error: 'Invalid token' });
    if (user.resetExpiry && user.resetExpiry < new Date()) return res.status(400).json({ error: 'Token expired' });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpiry: null }
    });
    return res.json({ message: 'Password reset successfully' });
  } catch {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
}));

export default router;
