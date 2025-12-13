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
exports.getStudentAnonSessions = exports.getCounselorAnonSessions = exports.getAnonSession = exports.createAnonSession = void 0;
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
