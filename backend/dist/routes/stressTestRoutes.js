"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stressTestController_1 = require("../controllers/stressTestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public route - Get stress test questions
router.get('/questions', stressTestController_1.getQuestions);
// Student routes - require authentication
router.use(authMiddleware_1.authenticateToken);
// CREATE - Submit new stress test
router.post('/submit', (0, authMiddleware_1.requireRole)(['STUDENT']), stressTestController_1.submitTest);
// READ - Get all my stress test results
router.get('/my-results', (0, authMiddleware_1.requireRole)(['STUDENT']), stressTestController_1.getMyResults);
// READ - Get single stress test by ID
router.get('/my-results/:id', (0, authMiddleware_1.requireRole)(['STUDENT']), stressTestController_1.getStressTestById);
// UPDATE - Update stress test result
router.put('/my-results/:id', (0, authMiddleware_1.requireRole)(['STUDENT']), stressTestController_1.updateStressTest);
// DELETE - Delete stress test result
router.delete('/my-results/:id', (0, authMiddleware_1.requireRole)(['STUDENT']), stressTestController_1.deleteStressTest);
// Counselor routes - Get student's stress test results
router.get('/student/:studentId', (0, authMiddleware_1.requireRole)(['COUNSELOR', 'ADMIN']), stressTestController_1.getStudentResults);
exports.default = router;
