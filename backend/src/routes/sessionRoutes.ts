import { Router } from 'express';
import { createSession, getMySessions, rescheduleSession, cancelSession, deleteSession, deleteSessionHistory } from '../controllers/sessionController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole(['STUDENT']), createSession);
router.get('/my', requireRole(['STUDENT']), getMySessions);
router.put('/:id/reschedule', requireRole(['STUDENT']), rescheduleSession);
router.put('/:id', cancelSession); // Both student and counselor can cancel
router.delete('/history', requireRole(['STUDENT']), deleteSessionHistory);
router.delete('/:id', requireRole(['STUDENT']), deleteSession);
router.get('/:id/chat', async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        // Verify access
        const session = await prisma.session.findUnique({ where: { id: Number(id) } });
        if (!session || (session.student_id !== userId && session.counselor_id !== userId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const chatSession = await prisma.chatSession.findUnique({
            where: { session_id: Number(id) },
            include: {
                messages: {
                    include: { sender: { select: { full_name: true } } },
                    orderBy: { sent_at: 'asc' }
                }
            }
        });

        res.json(chatSession?.messages || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

export default router;
