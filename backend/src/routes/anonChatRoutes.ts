import { Router } from 'express';
import { createAnonSession, getAnonSession, getCounselorAnonSessions, getStudentAnonSessions } from '../controllers/anonChatController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Student creates session (Authenticated or Public? Let's make it authenticated for now to prevent spam, but hidden)
router.post('/', authenticateToken, requireRole(['STUDENT']), createAnonSession);

// Student gets their anon chat history
router.get('/student/history', authenticateToken, requireRole(['STUDENT']), getStudentAnonSessions);

// Counselor gets their anon sessions
router.get('/counselor/sessions', authenticateToken, requireRole(['COUNSELOR']), getCounselorAnonSessions);

// Counselor views specific session
router.get('/:id', authenticateToken, requireRole(['COUNSELOR', 'STUDENT']), getAnonSession);

export default router;
