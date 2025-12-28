import { Router } from 'express';
import { getCounselors, getSessionRequests, approveSession, rejectSession, getCounselorActivity, getCounselorStats } from '../controllers/counselorController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public/Student can list counselors
router.get('/', authenticateToken, getCounselors);

// Counselor specific
router.get('/stats', authenticateToken, requireRole(['COUNSELOR']), getCounselorStats);
router.get('/requests', authenticateToken, requireRole(['COUNSELOR']), getSessionRequests);
router.post('/requests/:id/approve', authenticateToken, requireRole(['COUNSELOR']), approveSession);
router.post('/requests/:id/reject', authenticateToken, requireRole(['COUNSELOR']), rejectSession);
router.get('/my-activity', authenticateToken, requireRole(['COUNSELOR']), getCounselorActivity);

export default router;
