import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get My Notifications
export const getNotifications = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark Notification as Read
export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        // Ensure notification belongs to user
        const notification = await prisma.notification.findFirst({
            where: { id: Number(id), user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await prisma.notification.update({
            where: { id: Number(id) },
            data: { is_read: true }
        });

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// Mark All as Read
export const markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};
