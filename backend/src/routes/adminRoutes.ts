import { Router } from 'express';
import { getPendingUsers, verifyUser, createUser, getDashboardStats, getAllUsers, deleteUser, sendNotification } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticateToken, requireRole(['ADMIN']), getDashboardStats);
router.get('/users', authenticateToken, requireRole(['ADMIN']), getAllUsers);
router.get('/pending-users', authenticateToken, requireRole(['ADMIN']), getPendingUsers);
router.post('/verify/:userId', authenticateToken, requireRole(['ADMIN']), verifyUser);
router.post('/users', authenticateToken, requireRole(['ADMIN']), createUser);
router.delete('/users/:userId', authenticateToken, requireRole(['ADMIN']), deleteUser);
router.post('/notifications/send', authenticateToken, requireRole(['ADMIN']), sendNotification);

export default router;

