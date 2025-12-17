import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';

// Create Anonymous Session (Student)
export const createAnonSession = async (req: Request, res: Response) => {
    try {
        const anonToken = uuidv4();
        const studentId = req.user?.id; // Get student ID from authenticated user
        const session = await prisma.anonChatSession.create({
            data: {
                anon_token: anonToken,
                student_id: studentId,
                counselor_id: req.body.counselor_id,
                status: 'OPEN'
            }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error creating anonymous session' });
    }
};

// Get Anon Session (for Counselor or Student)
export const getAnonSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const session = await prisma.anonChatSession.findUnique({
            where: { id: Number(id) },
            include: { messages: true }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session' });
    }
};

// Get All Anon Sessions for Counselor
export const getCounselorAnonSessions = async (req: Request, res: Response) => {
    const counselorId = req.user?.id;
    try {
        const sessions = await prisma.anonChatSession.findMany({
            where: {
                counselor_id: counselorId,
                status: 'OPEN'
            },
            include: {
                messages: {
                    orderBy: { sent_at: 'desc' },
                    take: 1
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching anonymous sessions' });
    }
};

// Get Student's Anon Chat History
export const getStudentAnonSessions = async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    try {
        const sessions = await prisma.anonChatSession.findMany({
            where: {
                student_id: studentId
            },
            include: {
                messages: {
                    orderBy: { sent_at: 'desc' },
                    take: 1
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching anonymous chat history' });
    }
};

// Update Anonymous Session (UPDATE)
export const updateAnonSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // status: 'OPEN' | 'CLOSED'
    const userId = req.user?.id;

    try {
        const session = await prisma.anonChatSession.findUnique({ where: { id: Number(id) } });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check authorization (either student owner or counselor)
        if (session.student_id !== userId && session.counselor_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this session' });
        }

        const updatedSession = await prisma.anonChatSession.update({
            where: { id: Number(id) },
            data: {
                status,
                closed_at: status === 'CLOSED' ? new Date() : session.closed_at
            }
        });

        res.json(updatedSession);
    } catch (error) {
        console.error('Error updating anonymous session:', error);
        res.status(500).json({ message: 'Error updating anonymous session' });
    }
};

// Delete Anonymous Session (DELETE)
export const deleteAnonSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const session = await prisma.anonChatSession.findUnique({
            where: { id: Number(id) },
            include: { messages: true }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Only student owner can delete their anonymous chat history
        if (session.student_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this session' });
        }

        // Delete all messages first, then delete session
        await prisma.anonChatMessage.deleteMany({
            where: { anon_chat_session_id: Number(id) }
        });

        await prisma.anonChatSession.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Anonymous chat session deleted successfully' });
    } catch (error) {
        console.error('Error deleting anonymous session:', error);
        res.status(500).json({ message: 'Error deleting anonymous session' });
    }
};
