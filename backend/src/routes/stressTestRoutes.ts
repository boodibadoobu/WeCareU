import { Router } from 'express';
import {
    getQuestions,
    submitTest,
    getMyResults,
    getStressTestById,
    updateStressTest,
    deleteStressTest,
    getStudentResults,
    getAllQuestionsAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    restoreQuestion
} from '../controllers/stressTestController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public route - Get stress test questions
router.get('/questions', getQuestions);

// Student routes - require authentication
router.use(authenticateToken);

// CREATE - Submit new stress test
router.post('/submit', requireRole(['STUDENT']), submitTest);

// READ - Get all my stress test results
router.get('/my-results', requireRole(['STUDENT']), getMyResults);

// READ - Get single stress test by ID
router.get('/my-results/:id', requireRole(['STUDENT']), getStressTestById);

// UPDATE - Update stress test result
router.put('/my-results/:id', requireRole(['STUDENT']), updateStressTest);

// DELETE - Delete stress test result
router.delete('/my-results/:id', requireRole(['STUDENT']), deleteStressTest);

// Counselor routes - Get student's stress test results
router.get('/student/:studentId', requireRole(['COUNSELOR', 'ADMIN']), getStudentResults);

// ADMIN routes - Question management
router.get('/admin/questions', requireRole(['ADMIN']), getAllQuestionsAdmin);
router.post('/admin/questions', requireRole(['ADMIN']), createQuestion);
router.put('/admin/questions/:id', requireRole(['ADMIN']), updateQuestion);
router.put('/admin/questions/:id/restore', requireRole(['ADMIN']), restoreQuestion);
router.delete('/admin/questions/:id', requireRole(['ADMIN']), deleteQuestion);

export default router;
