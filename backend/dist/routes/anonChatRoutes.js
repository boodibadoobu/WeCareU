"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const anonChatController_1 = require("../controllers/anonChatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Student creates session (Authenticated or Public? Let's make it authenticated for now to prevent spam, but hidden)
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['STUDENT']), anonChatController_1.createAnonSession);
// Student gets their anon chat history
router.get('/student/history', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['STUDENT']), anonChatController_1.getStudentAnonSessions);
// Counselor gets their anon sessions
router.get('/counselor/sessions', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR']), anonChatController_1.getCounselorAnonSessions);
// Counselor views specific session
router.get('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR', 'STUDENT']), anonChatController_1.getAnonSession);
exports.default = router;
