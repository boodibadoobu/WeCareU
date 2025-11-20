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
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*', // Allow all for dev, restrict in prod
            methods: ['GET', 'POST']
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error'));
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });
    io.on('connection', (socket) => {
        var _a;
        console.log(`User connected: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.id}`);
        // Join session room
        socket.on('join_session', (sessionId) => {
            var _a;
            socket.join(`session_${sessionId}`);
            console.log(`User ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.id} joined session ${sessionId}`);
        });
        // Send message
        socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const { sessionId, content } = data;
            const senderId = (_a = socket.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                // Find or create ChatSession
                let chatSession = yield prisma_1.default.chatSession.findUnique({
                    where: { session_id: Number(sessionId) }
                });
                if (!chatSession) {
                    chatSession = yield prisma_1.default.chatSession.create({
                        data: { session_id: Number(sessionId) }
                    });
                }
                // Save to DB
                const message = yield prisma_1.default.chatMessage.create({
                    data: {
                        chat_session_id: chatSession.id,
                        sender_id: senderId,
                        message_text: content
                    },
                    include: { sender: { select: { full_name: true } } }
                });
                // Broadcast to room
                io.to(`session_${sessionId}`).emit('receive_message', message);
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        }));
        // Send anonymous message
        socket.on('send_anon_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { sessionId, content, senderType } = data;
            try {
                const message = yield prisma_1.default.anonChatMessage.create({
                    data: {
                        anon_chat_session_id: sessionId,
                        sender_type: senderType, // STUDENT or COUNSELOR
                        message_text: content
                    }
                });
                io.to(`anon_session_${sessionId}`).emit('receive_anon_message', message);
            }
            catch (error) {
                console.error('Error sending anon message:', error);
            }
        }));
        socket.on('join_anon_session', (sessionId) => {
            socket.join(`anon_session_${sessionId}`);
            console.log(`User joined anon session ${sessionId}`);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
exports.initSocket = initSocket;
