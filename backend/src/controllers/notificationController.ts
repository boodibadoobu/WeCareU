import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// CREATE - Create Notification
export const createNotification = async (req: Request, res: Response) => {
    const { user_id, type, title, body } = req.body;

    // Validasi input
    const validationErrors = [];

    if (!user_id) {
        validationErrors.push('user_id is required');
    } else if (isNaN(Number(user_id))) {
        validationErrors.push('user_id must be a valid number');
    }

    if (!type) {
        validationErrors.push('type is required');
    } else if (!['SESSION', 'STRESS_RESULT', 'SYSTEM'].includes(type)) {
        validationErrors.push('type must be one of: SESSION, STRESS_RESULT, SYSTEM');
    }

    if (!title) {
        validationErrors.push('title is required');
    } else if (title.trim().length < 3) {
        validationErrors.push('title must be at least 3 characters long');
    } else if (title.length > 255) {
        validationErrors.push('title must not exceed 255 characters');
    }

    if (!body) {
        validationErrors.push('body is required');
    } else if (body.trim().length < 5) {
        validationErrors.push('body must be at least 5 characters long');
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationErrors
        });
    }

    try {
        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: Number(user_id) }
        });

        if (!userExists) {
            return res.status(404).json({
                message: 'User not found',
                errors: ['The specified user_id does not exist']
            });
        }

        const notification = await prisma.notification.create({
            data: {
                user_id: Number(user_id),
                type,
                title: title.trim(),
                body: body.trim(),
                is_read: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating notification',
            error: String(error)
        });
    }
};

// READ - Get My Notifications
export const getNotifications = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        const unreadCount = await prisma.notification.count({
            where: { user_id: userId, is_read: false }
        });

        res.json({
            message: 'Notifications fetched successfully',
            data: notifications,
            total: notifications.length,
            unread: unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// READ - Get Single Notification by ID
export const getNotificationById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid notification ID']
        });
    }

    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: Number(id),
                user_id: userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found or you do not have permission to view it'
            });
        }

        res.json({
            message: 'Notification fetched successfully',
            data: notification
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification' });
    }
};

// UPDATE - Mark Notification as Read
export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid notification ID']
        });
    }

    try {
        // Ensure notification belongs to user
        const notification = await prisma.notification.findFirst({
            where: { id: Number(id), user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found or you do not have permission to update it'
            });
        }

        if (notification.is_read) {
            return res.status(400).json({
                message: 'Notification is already marked as read'
            });
        }

        const updated = await prisma.notification.update({
            where: { id: Number(id) },
            data: { is_read: true }
        });

        res.json({
            message: 'Notification marked as read successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// UPDATE - Mark All as Read
export const markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });

        res.json({
            message: 'All notifications marked as read successfully',
            updatedCount: result.count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

// DELETE - Delete Single Notification
export const deleteNotification = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid notification ID']
        });
    }

    try {
        const notification = await prisma.notification.findFirst({
            where: { id: Number(id), user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found or you do not have permission to delete it'
            });
        }

        // Only allow deletion if notification is read
        if (!notification.is_read) {
            return res.status(400).json({ message: 'Cannot delete unread notifications' });
        }

        await prisma.notification.delete({
            where: { id: Number(id) }
        });

        res.json({
            message: 'Notification deleted successfully',
            deletedId: Number(id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error deleting notification',
            error: String(error)
        });
    }
};

// DELETE - Delete All Read Notifications
export const deleteAllRead = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await prisma.notification.deleteMany({
            where: { user_id: userId, is_read: true }
        });

        res.json({
            message: 'All read notifications deleted successfully',
            deletedCount: result.count
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting notifications',
            error: String(error)
        });
    }
};
