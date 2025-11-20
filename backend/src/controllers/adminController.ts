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
