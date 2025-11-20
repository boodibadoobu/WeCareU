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
exports.getAnonSession = exports.createAnonSession = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const uuid_1 = require("uuid");
// Create Anonymous Session (Student)
const createAnonSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // No auth required for student side in theory, but for this app maybe we require student login?
    // Requirement says "Anonymous Chat (non-login or login but hidden)".
    // Let's assume logged in student but identity hidden from counselor.
    // Or completely public?
    // "Mahasiswa dapat melakukan konsultasi secara anonim".
    // If they are logged in, we can hide their name.
    // If they are not logged in, we need a public endpoint.
    // Let's assume they are logged in for simplicity of access control, but we don't link `student_id` to the session visibly.
    // Actually, `AnonChatSession` in schema doesn't have `student_id`. It has `anon_token`.
    try {
        const anonToken = (0, uuid_1.v4)();
        const session = yield prisma_1.default.anonChatSession.create({
            data: {
                anon_token: anonToken,
                counselor_id: req.body.counselor_id, // Optional: pick a counselor or random?
                // Schema says counselor_id is Int. So they must pick one.
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
// Get Anon Session (for Counselor)
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
