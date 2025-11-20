import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './utils/prisma';
import jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
    user?: any;
}

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow all for dev, restrict in prod
            methods: ['GET', 'POST']
        }
    });

    io.use((socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket: AuthSocket) => {
        console.log(`User connected: ${socket.user?.id}`);

        // Join session room
        socket.on('join_session', (sessionId: string) => {
            socket.join(`session_${sessionId}`);
            console.log(`User ${socket.user?.id} joined session ${sessionId}`);
        });

        // Send message
        socket.on('send_message', async (data: { sessionId: number, content: string }) => {
            const { sessionId, content } = data;
            const senderId = socket.user?.id;

            try {
                // Find or create ChatSession
                let chatSession = await prisma.chatSession.findUnique({
                    where: { session_id: Number(sessionId) }
                });

                if (!chatSession) {
                    chatSession = await prisma.chatSession.create({
                        data: { session_id: Number(sessionId) }
                    });
                }

                // Save to DB
                const message = await prisma.chatMessage.create({
                    data: {
                        chat_session_id: chatSession.id,
                        sender_id: senderId,
                        message_text: content
                    },
                    include: { sender: { select: { full_name: true } } }
                });

                // Broadcast to room
                io.to(`session_${sessionId}`).emit('receive_message', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Send anonymous message
        socket.on('send_anon_message', async (data: { sessionId: number, content: string, senderType: string }) => {
            const { sessionId, content, senderType } = data;

            try {
                const message = await prisma.anonChatMessage.create({
                    data: {
                        anon_chat_session_id: sessionId,
                        sender_type: senderType, // STUDENT or COUNSELOR
                        message_text: content
                    }
                });

                io.to(`anon_session_${sessionId}`).emit('receive_anon_message', message);
            } catch (error) {
                console.error('Error sending anon message:', error);
            }
        });

        socket.on('join_anon_session', (sessionId: string) => {
            socket.join(`anon_session_${sessionId}`);
            console.log(`User joined anon session ${sessionId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};
