"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllRead = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotificationById = exports.getNotifications = exports.createNotification = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// CREATE - Create Notification
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, type, title, body } = req.body;
    // Validasi input
    const validationErrors = [];
    if (!user_id) {
        validationErrors.push('user_id is required');
    }
    else if (isNaN(Number(user_id))) {
        validationErrors.push('user_id must be a valid number');
    }
    if (!type) {
        validationErrors.push('type is required');
    }
    else if (!['SESSION', 'STRESS_RESULT', 'SYSTEM'].includes(type)) {
        validationErrors.push('type must be one of: SESSION, STRESS_RESULT, SYSTEM');
    }
    if (!title) {
        validationErrors.push('title is required');
    }
    else if (title.trim().length < 3) {
        validationErrors.push('title must be at least 3 characters long');
    }
    else if (title.length > 255) {
        validationErrors.push('title must not exceed 255 characters');
    }
    if (!body) {
        validationErrors.push('body is required');
    }
    else if (body.trim().length < 5) {
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
        const userExists = yield prisma_1.default.user.findUnique({
            where: { id: Number(user_id) }
        });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found',
                errors: ['The specified user_id does not exist']
            });
        }
        const notification = yield prisma_1.default.notification.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating notification',
            error: String(error)
        });
    }
});
exports.createNotification = createNotification;
// READ - Get My Notifications
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const notifications = yield prisma_1.default.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        const unreadCount = yield prisma_1.default.notification.count({
            where: { user_id: userId, is_read: false }
        });
        res.json({
            message: 'Notifications fetched successfully',
            data: notifications,
            total: notifications.length,
            unread: unreadCount
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});
exports.getNotifications = getNotifications;
// READ - Get Single Notification by ID
const getNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const notification = yield prisma_1.default.notification.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notification' });
    }
});
exports.getNotificationById = getNotificationById;
// UPDATE - Mark Notification as Read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const notification = yield prisma_1.default.notification.findFirst({
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
        const updated = yield prisma_1.default.notification.update({
            where: { id: Number(id) },
            data: { is_read: true }
        });
        res.json({
            message: 'Notification marked as read successfully',
            data: updated
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});
exports.markAsRead = markAsRead;
// UPDATE - Mark All as Read
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const result = yield prisma_1.default.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });
        res.json({
            message: 'All notifications marked as read successfully',
            updatedCount: result.count
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
});
exports.markAllAsRead = markAllAsRead;
// DELETE - Delete Single Notification
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const notification = yield prisma_1.default.notification.findFirst({
            where: { id: Number(id), user_id: userId }
        });
        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found or you do not have permission to delete it'
            });
        }
        yield prisma_1.default.notification.delete({
            where: { id: Number(id) }
        });
        res.json({
            message: 'Notification deleted successfully',
            deletedId: Number(id)
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error deleting notification',
            error: String(error)
        });
    }
});
exports.deleteNotification = deleteNotification;
// DELETE - Delete All Read Notifications
const deleteAllRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const result = yield prisma_1.default.notification.deleteMany({
            where: { user_id: userId, is_read: true }
        });
        res.json({
            message: 'All read notifications deleted successfully',
            deletedCount: result.count
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting notifications',
            error: String(error)
        });
    }
});
exports.deleteAllRead = deleteAllRead;
