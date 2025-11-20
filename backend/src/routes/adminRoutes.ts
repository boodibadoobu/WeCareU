import { Router } from 'express';
import { getPendingUsers, verifyUser, createUser, getDashboardStats } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticateToken, requireRole(['ADMIN']), getDashboardStats);
router.get('/pending-users', authenticateToken, requireRole(['ADMIN']), getPendingUsers);
router.post('/verify/:userId', authenticateToken, requireRole(['ADMIN']), verifyUser);
router.post('/users', authenticateToken, requireRole(['ADMIN']), createUser);

export default router;
