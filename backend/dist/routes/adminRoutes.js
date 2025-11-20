"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes require ADMIN role
router.use(authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']));
router.get('/pending-users', adminController_1.getPendingUsers);
router.post('/users/:id/verify', adminController_1.verifyUser); // Unified approve/reject endpoint or split as per WBS
router.post('/users/:id/approve', (req, res, next) => { req.body.action = 'APPROVE'; (0, adminController_1.verifyUser)(req, res); });
router.post('/users/:id/reject', (req, res, next) => { req.body.action = 'REJECT'; (0, adminController_1.verifyUser)(req, res); });
router.post('/users', adminController_1.createUser);
exports.default = router;
