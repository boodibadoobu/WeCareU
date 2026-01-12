import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all counselors (for students to browse)
export const getCounselors = async (req: Request, res: Response) => {
    try {
        const counselors = await prisma.user.findMany({
            where: { role: 'COUNSELOR', status: 'ACTIVE' },
            select: {
                id: true,
                full_name: true,
                counselor_details: true
            }
        });
        res.json(counselors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching counselors' });
    }
};

// Get session requests for logged-in counselor
export const getSessionRequests = async (req: Request, res: Response) => {
    const counselorId = req.user?.id;
    try {
        const sessions = await prisma.session.findMany({
            where: { counselor_id: counselorId, status: 'PENDING' },
            include: {
                student: {
                    select: {
                        full_name: true,
                        nim: true,
                        stress_tests: {
                            take: 1,
                            orderBy: { taken_at: 'desc' },
                            select: {
                                total_score: true,
                                category: true,
                                taken_at: true
                            }
                        }
                    }
                }
            }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

// Approve/Reject session
export const updateSessionStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT
    const counselorId = req.user?.id;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        await prisma.session.update({
            where: { id: Number(id) },
            data: { status: newStatus }
        });

        // TODO: Create notification for student

        res.json({ message: `Session ${newStatus}` });
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ message: 'Error updating session' });
    }
};

// Approve session
export const approveSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const counselorId = req.user?.id;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }

        await prisma.session.update({
            where: { id: Number(id) },
            data: { status: 'APPROVED' }
        });

        res.json({ message: 'Session APPROVED' });
    } catch (error) {
        console.error('Error approving session:', error);
        res.status(500).json({ message: 'Error approving session' });
    }
};

// Reject session
export const rejectSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const counselorId = req.user?.id;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }

        await prisma.session.update({
            where: { id: Number(id) },
            data: { status: 'REJECTED' }
        });

        res.json({ message: 'Session REJECTED' });
    } catch (error) {
        console.error('Error rejecting session:', error);
        res.status(500).json({ message: 'Error rejecting session' });
    }
};

// Get Counselor Stats for Dashboard
export const getCounselorStats = async (req: Request, res: Response) => {
    const counselorId = req.user?.id;
    try {
        // Count unique students helped (have at least one completed session)
        const uniqueStudents = await prisma.session.findMany({
            where: {
                counselor_id: counselorId,
                status: 'COMPLETED'
            },
            select: {
                student_id: true
            },
            distinct: ['student_id']
        });

        // Count pending requests
        const pendingCount = await prisma.session.count({
            where: {
                counselor_id: counselorId,
                status: 'PENDING'
            }
        });

        // Count approved sessions
        const approvedCount = await prisma.session.count({
            where: {
                counselor_id: counselorId,
                status: 'APPROVED'
            }
        });

        // Count completed sessions
        const completedCount = await prisma.session.count({
            where: {
                counselor_id: counselorId,
                status: 'COMPLETED'
            }
        });

        // Count articles created by counselor
        const articlesCount = await prisma.article.count({
            where: {
                author_id: counselorId
            }
        });

        res.json({
            totalStudentsHelped: uniqueStudents.length,
            pendingRequests: pendingCount,
            approvedSessions: approvedCount,
            completedSessions: completedCount,
            articlesCreated: articlesCount
        });
    } catch (error) {
        console.error('Error fetching counselor stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// Get My Activity (History)
export const getCounselorActivity = async (req: Request, res: Response) => {
    const counselorId = req.user?.id;
    try {
        const sessions = await prisma.session.findMany({
            where: { counselor_id: counselorId, status: { in: ['COMPLETED', 'APPROVED', 'REJECTED'] } },
            include: {
                student: {
                    select: {
                        full_name: true,
                        stress_tests: {
                            take: 1,
                            orderBy: { taken_at: 'desc' },
                            select: {
                                total_score: true,
                                category: true,
                                taken_at: true
                            }
                        }
                    }
                }
            },
            orderBy: { scheduled_start: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity' });
    }
};
