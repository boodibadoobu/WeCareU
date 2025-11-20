import { Router } from 'express';
import { getQuestions, submitTest, getMyResults, getStudentResults } from '../controllers/stressTestController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/questions', authenticateToken, requireRole(['STUDENT']), getQuestions);
router.post('/submit', authenticateToken, requireRole(['STUDENT']), submitTest);
router.get('/history', authenticateToken, requireRole(['STUDENT']), getMyResults);
router.get('/student/:studentId', authenticateToken, requireRole(['COUNSELOR', 'ADMIN']), getStudentResults);

export default router;
