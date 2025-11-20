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
