import { Router } from 'express';
import { 
    createNotification,
    getNotifications, 
    getNotificationById,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} from '../controllers/notificationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CREATE - Admin/System can create notifications for users
router.post('/', requireRole(['ADMIN']), createNotification);

// READ - Get all my notifications
router.get('/', getNotifications);

// READ - Get single notification by ID
router.get('/:id', getNotificationById);

// UPDATE - Mark notification as read
router.put('/:id/read', markAsRead);

// UPDATE - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// DELETE - Delete all read notifications (must be before /:id route)
router.delete('/read/clear-all', deleteAllRead);

// DELETE - Delete single notification
router.delete('/:id', deleteNotification);

export default router;
