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
exports.deleteAnonSession = exports.updateAnonSession = exports.getStudentAnonSessions = exports.getCounselorAnonSessions = exports.getAnonSession = exports.createAnonSession = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const uuid_1 = require("uuid");
// Create Anonymous Session (Student)
const createAnonSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const anonToken = (0, uuid_1.v4)();
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get student ID from authenticated user
        const session = yield prisma_1.default.anonChatSession.create({
            data: {
                anon_token: anonToken,
                student_id: studentId,
                counselor_id: req.body.counselor_id,
                status: 'OPEN'
            }
        });
        res.json(session);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating anonymous session' });
    }
});
exports.createAnonSession = createAnonSession;
// Get Anon Session (for Counselor or Student)
const getAnonSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const session = yield prisma_1.default.anonChatSession.findUnique({
            where: { id: Number(id) },
            include: { messages: true }
        });
        res.json(session);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching session' });
    }
});
exports.getAnonSession = getAnonSession;
// Get All Anon Sessions for Counselor
const getCounselorAnonSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const sessions = yield prisma_1.default.anonChatSession.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching anonymous sessions' });
    }
});
exports.getCounselorAnonSessions = getCounselorAnonSessions;
// Get Student's Anon Chat History
const getStudentAnonSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const sessions = yield prisma_1.default.anonChatSession.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching anonymous chat history' });
    }
});
exports.getStudentAnonSessions = getStudentAnonSessions;
// Update Anonymous Session (UPDATE)
const updateAnonSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { status } = req.body; // status: 'OPEN' | 'CLOSED'
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const session = yield prisma_1.default.anonChatSession.findUnique({ where: { id: Number(id) } });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        // Check authorization (either student owner or counselor)
        if (session.student_id !== userId && session.counselor_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this session' });
        }
        const updatedSession = yield prisma_1.default.anonChatSession.update({
            where: { id: Number(id) },
            data: {
                status,
                closed_at: status === 'CLOSED' ? new Date() : session.closed_at
            }
        });
        res.json(updatedSession);
    }
    catch (error) {
        console.error('Error updating anonymous session:', error);
        res.status(500).json({ message: 'Error updating anonymous session' });
    }
});
exports.updateAnonSession = updateAnonSession;
// Delete Anonymous Session (DELETE)
const deleteAnonSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const session = yield prisma_1.default.anonChatSession.findUnique({
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
        yield prisma_1.default.anonChatMessage.deleteMany({
            where: { anon_chat_session_id: Number(id) }
        });
        yield prisma_1.default.anonChatSession.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Anonymous chat session deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting anonymous session:', error);
        res.status(500).json({ message: 'Error deleting anonymous session' });
    }
});
exports.deleteAnonSession = deleteAnonSession;
