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
exports.getCounselorActivity = exports.rejectSession = exports.approveSession = exports.updateSessionStatus = exports.getSessionRequests = exports.getCounselors = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get all counselors (for students to browse)
const getCounselors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counselors = yield prisma_1.default.user.findMany({
            where: { role: 'COUNSELOR', status: 'ACTIVE' },
            select: {
                id: true,
                full_name: true,
                counselor_details: true
            }
        });
        res.json(counselors);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching counselors' });
    }
});
exports.getCounselors = getCounselors;
// Get session requests for logged-in counselor
const getSessionRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const sessions = yield prisma_1.default.session.findMany({
            where: { counselor_id: counselorId, status: 'PENDING' },
            include: { student: { select: { full_name: true, nim: true } } }
        });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
});
exports.getSessionRequests = getSessionRequests;
// Approve/Reject session
const updateSessionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const session = yield prisma_1.default.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        yield prisma_1.default.session.update({
            where: { id: Number(id) },
            data: { status: newStatus }
        });
        // TODO: Create notification for student
        res.json({ message: `Session ${newStatus}` });
    }
    catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ message: 'Error updating session' });
    }
});
exports.updateSessionStatus = updateSessionStatus;
// Approve session
const approveSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const session = yield prisma_1.default.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }
        yield prisma_1.default.session.update({
            where: { id: Number(id) },
            data: { status: 'APPROVED' }
        });
        res.json({ message: 'Session APPROVED' });
    }
    catch (error) {
        console.error('Error approving session:', error);
        res.status(500).json({ message: 'Error approving session' });
    }
});
exports.approveSession = approveSession;
// Reject session
const rejectSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const session = yield prisma_1.default.session.findUnique({ where: { id: Number(id) } });
        if (!session || session.counselor_id !== counselorId) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }
        yield prisma_1.default.session.update({
            where: { id: Number(id) },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Session REJECTED' });
    }
    catch (error) {
        console.error('Error rejecting session:', error);
        res.status(500).json({ message: 'Error rejecting session' });
    }
});
exports.rejectSession = rejectSession;
// Get My Activity (History)
const getCounselorActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const counselorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const sessions = yield prisma_1.default.session.findMany({
            where: { counselor_id: counselorId, status: { in: ['COMPLETED', 'APPROVED', 'REJECTED'] } },
            include: { student: { select: { full_name: true } } },
            orderBy: { scheduled_start: 'desc' }
        });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activity' });
    }
});
exports.getCounselorActivity = getCounselorActivity;
