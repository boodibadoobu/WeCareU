import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Helper function to create notifications
async function createNotificationHelper(
    userId: number,
    type: string,
    title: string,
    body: string
) {
    try {
        await prisma.notification.create({
            data: {
                user_id: userId,
                type: type as any,
                title,
                body,
                is_read: false
            }
        });
        console.log(`Notification created for user ${userId}: ${title}`);
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

// Create Session (Student)
export const createSession = async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const { counselor_id, scheduled_start } = req.body;

    // Debug logging
    console.log('=== CREATE SESSION DEBUG ===');
    console.log('Student ID:', studentId);
    console.log('Request Body:', req.body);
    console.log('Counselor ID:', counselor_id);
    console.log('Scheduled Start:', scheduled_start);

    // Validation checks
    if (!studentId) {
        console.error('ERROR: studentId is undefined - auth token might be invalid');
        return res.status(400).json({ message: 'Student ID not found. Please login again.' });
    }

    if (!counselor_id) {
        console.error('ERROR: counselor_id is missing');
        return res.status(400).json({ message: 'Counselor ID is required' });
    }

    if (!scheduled_start) {
        console.error('ERROR: scheduled_start is missing');
        return res.status(400).json({ message: 'Scheduled start time is required' });
    }

    // --- SCREENING VALIDATION ---
    try {
        // 1. Pre-test Check: Student must have taken at least one stress test ever
        const hasStressTest = await prisma.stressTest.findFirst({
            where: { student_id: studentId }
        });

        if (!hasStressTest) {
            return res.status(400).json({
                message: 'Screening Required: You must complete a stress test before booking your first session.',
                code: 'PRE_TEST_REQUIRED'
            });
        }

        // 2. Post-test Check: If student has a previous COMPLETED session, they must have taken a test AFTER it.
        const lastCompletedSession = await prisma.session.findFirst({
            where: {
                student_id: studentId,
                status: 'COMPLETED'
            },
            orderBy: { scheduled_end: 'desc' }
        });

        if (lastCompletedSession) {
            const postTest = await prisma.stressTest.findFirst({
                where: {
                    student_id: studentId,
                    taken_at: { gt: lastCompletedSession.scheduled_end }
                }
            });

            if (!postTest) {
                return res.status(400).json({
                    message: 'Post-Counseling Screening Required: You must complete a stress test to evaluate your progress after your last session.',
                    code: 'POST_TEST_REQUIRED'
                });
            }
        }
    } catch (validationError) {
        console.error('Validation error:', validationError);
        return res.status(500).json({ message: 'Error validating session requirements' });
    }
    // ----------------------------

    try {
        const startTime = new Date(scheduled_start);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        console.log('Start Time:', startTime);
        console.log('End Time:', endTime);

        // Check availability (simplistic: check if counselor has overlapping session)
        const conflict = await prisma.session.findFirst({
            where: {
                counselor_id: Number(counselor_id),
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    {
                        scheduled_start: { lte: startTime },
                        scheduled_end: { gt: startTime }
                    },
                    {
                        scheduled_start: { lt: endTime },
                        scheduled_end: { gte: endTime }
                    }
                ]
            }
        });

        if (conflict) {
            console.log('CONFLICT FOUND:', conflict);
            return res.status(400).json({ message: 'Counselor is not available at this time' });
        }

        const session = await prisma.session.create({
            data: {
                student_id: studentId!,
                counselor_id: Number(counselor_id),
                scheduled_start: startTime,
                scheduled_end: endTime,
                status: 'PENDING'
            }
        });

        console.log('Session created successfully:', session);

        // Get student and counselor names for notifications
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { full_name: true }
        });

        const counselor = await prisma.user.findUnique({
            where: { id: Number(counselor_id) },
            select: { full_name: true }
        });

        // Format date for notification
        const formattedDate = startTime.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Send notification to student (booking confirmation)
        await createNotificationHelper(
            studentId!,
            'SESSION',
            '✅ Session Booked Successfully',
            `Your counseling session with ${counselor?.full_name} on ${formattedDate} is waiting for approval.`
        );

        // Send notification to counselor (new session request)
        await createNotificationHelper(
            Number(counselor_id),
            'SESSION',
            '🔔 New Session Request',
            `${student?.full_name} requested a counseling session on ${formattedDate}`
        );

        res.status(201).json(session);
    } catch (error) {
        console.error('ERROR creating session:', error);
        res.status(500).json({ message: 'Error creating session' });
    }
};

// Get My Sessions (Student)
export const getMySessions = async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    try {
        const sessions = await prisma.session.findMany({
            where: { student_id: studentId },
            include: { counselor: { select: { full_name: true } } },
            orderBy: { scheduled_start: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

// Reschedule Session (Student)
export const rescheduleSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { new_start } = req.body;
    const studentId = req.user?.id;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.student_id !== studentId) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.reschedule_count >= 1) {
            return res.status(400).json({ message: 'Cannot reschedule more than once' });
        }

        const now = new Date();
        const sessionStart = new Date(session.scheduled_start);
        const oneDayBefore = new Date(sessionStart.getTime() - 24 * 60 * 60 * 1000);

        if (now > oneDayBefore) {
            return res.status(400).json({ message: 'Can only reschedule 24h before session' });
        }

        const newStartTime = new Date(new_start);
        const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);

        // Check conflict with other sessions (excluding current session)
        const conflict = await prisma.session.findFirst({
            where: {
                counselor_id: session.counselor_id,
                status: { in: ['PENDING', 'APPROVED'] },
                id: { not: Number(id) }, // Exclude current session
                OR: [
                    {
                        scheduled_start: { lte: newStartTime },
                        scheduled_end: { gt: newStartTime }
                    },
                    {
                        scheduled_start: { lt: newEndTime },
                        scheduled_end: { gte: newEndTime }
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({
                message: 'Counselor is not available at the new time'
            });
        }

        await prisma.session.update({
            where: { id: Number(id) },
            data: {
                scheduled_start: newStartTime,
                scheduled_end: newEndTime,
                status: 'PENDING', // Needs re-approval
                reschedule_count: { increment: 1 }
            }
        });

        res.json({ message: 'Session rescheduled successfully' });
    } catch (error) {
        console.error('Error rescheduling session:', error);
        res.status(500).json({ message: 'Error rescheduling session' });
    }
};

// Cancel Session (Student or Counselor)
export const cancelSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Authorization: Student or Counselor involved in this session
        const isStudent = session.student_id === userId;
        const isCounselor = session.counselor_id === userId;

        if (!isStudent && !isCounselor) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Can only cancel if session is PENDING or APPROVED
        if (!['PENDING', 'APPROVED'].includes(session.status)) {
            return res.status(400).json({ message: `Cannot cancel ${session.status.toLowerCase()} sessions` });
        }

        // Update status to CANCELLED
        await prisma.session.update({
            where: { id: Number(id) },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Session cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling session:', error);
        res.status(500).json({ message: 'Error cancelling session' });
    }
};

// Delete Session (Student & Counselor)
export const deleteSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    try {
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Verify ownership based on role
        if (userRole === 'STUDENT') {
            if (session.student_id !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        } else if (userRole === 'COUNSELOR') {
            if (session.counselor_id !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        // Only allow deletion of inactive sessions (history)
        if (['PENDING', 'APPROVED'].includes(session.status)) {
            return res.status(400).json({ message: 'Cannot delete active sessions. Please cancel them first.' });
        }

        await prisma.session.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Error deleting session' });
    }
};
// Bulk Delete Session History (Student & Counselor)
export const deleteSessionHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status } = req.query; // Optional status filter: 'CANCELLED', 'REJECTED', 'COMPLETED'

    try {
        const whereClause: any = {
            status: { in: ['CANCELLED', 'REJECTED', 'COMPLETED'] }
        };

        if (userRole === 'STUDENT') {
            whereClause.student_id = userId;
        } else if (userRole === 'COUNSELOR') {
            whereClause.counselor_id = userId;
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        if (status) {
            if (!['CANCELLED', 'REJECTED', 'COMPLETED'].includes(String(status))) {
                return res.status(400).json({ message: 'Invalid status for deletion' });
            }
            whereClause.status = status;
        }

        const result = await prisma.session.deleteMany({
            where: whereClause
        });

        res.json({
            message: 'Session history deleted successfully',
            count: result.count
        });
    } catch (error) {
        console.error('Error deleting session history:', error);
        res.status(500).json({ message: 'Error deleting session history' });
    }
};
