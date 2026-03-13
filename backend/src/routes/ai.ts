import { Router } from 'express';
const router = Router();
router.get('/status', (_req, res) => res.json({ status: 'AI coming soon' }));
export default router;
