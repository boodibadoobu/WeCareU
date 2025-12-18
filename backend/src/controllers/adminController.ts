import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

// Get Pending Users
export const getPendingUsers = async (req: Request, res: Response) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: { status: 'PENDING' },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                created_at: true,
                counselor_details: true
            }
        });
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending users' });
    }
};

// Get All Users (for user management)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                nim: true,
                role: true,
                status: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Verify User (Approve/Reject)
export const verifyUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'APPROVE' | 'REJECT'
    const adminId = req.user?.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (action === 'APPROVE') {
            await prisma.user.update({
                where: { id: Number(userId) },
                data: { status: 'ACTIVE' }
            });
        } else if (action === 'REJECT') {
            // Optionally delete or mark as suspended
            await prisma.user.update({
                where: { id: Number(userId) },
                data: { status: 'SUSPENDED' }
            });
        }

        // Audit Log
        await prisma.verificationAudit.create({
            data: {
                target_user_id: Number(userId),
                admin_id: adminId!,
                action,
                reason
            }
        });

        res.json({ message: `User ${action}D successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying user' });
    }
};

// Create User (Admin/Counselor)
export const createUser = async (req: Request, res: Response) => {
    const { full_name, email, password, role, specialization } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                password_hash: hashedPassword,
                role,
                status: 'ACTIVE',
                counselor_details: role === 'COUNSELOR' ? {
                    create: {
                        specialization: specialization || 'General',
                        years_experience: 0,
                        available_days: []
                    }
                } : undefined
            }
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Get Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalStudents,
            totalCounselors,
            pendingVerifications,
            totalSessions,
            completedSessions
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'COUNSELOR' } }),
            prisma.user.count({ where: { status: 'PENDING' } }),
            prisma.session.count(),
            prisma.session.count({ where: { status: 'COMPLETED' } })
        ]);

        res.json({
            totalStudents,
            totalCounselors,
            pendingVerifications,
            totalSessions,
            completedSessions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// Delete User (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const adminId = req.user?.id;

    // Prevent admin from deleting themselves
    if (Number(userId) === adminId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                full_name: true,
                email: true,
                nim: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascade delete all related data in correct order
        // 1. Delete stress test answers first (foreign key to stress_tests)
        const stressTests = await prisma.stressTest.findMany({
            where: { student_id: Number(userId) },
            select: { id: true }
        });

        for (const test of stressTests) {
            await prisma.stressTestAnswer.deleteMany({
                where: { stress_test_id: test.id }
            });
        }

        // 2. Delete stress tests
        await prisma.stressTest.deleteMany({
            where: { student_id: Number(userId) }
        });

        // 3. Delete session notes (foreign key to sessions)
        const sessions = await prisma.session.findMany({
            where: {
                OR: [
                    { student_id: Number(userId) },
                    { counselor_id: Number(userId) }
                ]
            },
            select: { id: true }
        });

        for (const session of sessions) {
            await prisma.sessionNote.deleteMany({
                where: { session_id: session.id }
            });
        }

        // 4. Delete chat messages (foreign key to chat_sessions)
        await prisma.chatMessage.deleteMany({
            where: { sender_id: Number(userId) }
        });

        // 5. Delete chat sessions related to user's sessions
        for (const session of sessions) {
            // First delete messages in the chat session
            const chatSession = await prisma.chatSession.findUnique({
                where: { session_id: session.id }
            });

            if (chatSession) {
                await prisma.chatMessage.deleteMany({
                    where: { chat_session_id: chatSession.id }
                });
                await prisma.chatSession.delete({
                    where: { session_id: session.id }
                });
            }
        }

        // 6. Delete anonymous chat messages
        const anonChatSessions = await prisma.anonChatSession.findMany({
            where: {
                OR: [
                    { student_id: Number(userId) },
                    { counselor_id: Number(userId) }
                ]
            },
            select: { id: true }
        });

        for (const anonSession of anonChatSessions) {
            await prisma.anonChatMessage.deleteMany({
                where: { anon_chat_session_id: anonSession.id }
            });
        }

        // 7. Delete anonymous chat sessions
        await prisma.anonChatSession.deleteMany({
            where: {
                OR: [
                    { student_id: Number(userId) },
                    { counselor_id: Number(userId) }
                ]
            }
        });

        // 8. Delete sessions
        await prisma.session.deleteMany({
            where: {
                OR: [
                    { student_id: Number(userId) },
                    { counselor_id: Number(userId) }
                ]
            }
        });

        // 9. Delete articles
        await prisma.article.deleteMany({
            where: { author_id: Number(userId) }
        });

        // 10. Delete notifications
        await prisma.notification.deleteMany({
            where: { user_id: Number(userId) }
        });

        // 11. Delete counselor details if exists
        await prisma.counselorDetails.deleteMany({
            where: { user_id: Number(userId) }
        });

        // 12. Delete verification audits (both as admin and target)
        await prisma.verificationAudit.deleteMany({
            where: {
                OR: [
                    { admin_id: Number(userId) },
                    { target_user_id: Number(userId) }
                ]
            }
        });

        // 13. Finally, delete the user
        await prisma.user.delete({
            where: { id: Number(userId) }
        });

        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                nim: user.nim,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: String(error) });
    }
};

