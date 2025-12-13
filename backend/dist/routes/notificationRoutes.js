"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.authenticateToken);
// CREATE - Admin/System can create notifications for users
router.post('/', (0, authMiddleware_1.requireRole)(['ADMIN']), notificationController_1.createNotification);
// READ - Get all my notifications
router.get('/', notificationController_1.getNotifications);
// READ - Get single notification by ID
router.get('/:id', notificationController_1.getNotificationById);
// UPDATE - Mark notification as read
router.put('/:id/read', notificationController_1.markAsRead);
// UPDATE - Mark all notifications as read
router.put('/read-all', notificationController_1.markAllAsRead);
// DELETE - Delete all read notifications (must be before /:id route)
router.delete('/read/clear-all', notificationController_1.deleteAllRead);
// DELETE - Delete single notification
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
