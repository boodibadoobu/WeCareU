"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counselorController_1 = require("../controllers/counselorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public/Student can list counselors
router.get('/', authMiddleware_1.authenticateToken, counselorController_1.getCounselors);
// Counselor specific
router.get('/requests', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR']), counselorController_1.getSessionRequests);
router.post('/requests/:id/approve', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR']), counselorController_1.approveSession);
router.post('/requests/:id/reject', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR']), counselorController_1.rejectSession);
router.get('/my-activity', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['COUNSELOR']), counselorController_1.getCounselorActivity);
exports.default = router;
