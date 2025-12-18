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
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.post('/', (0, authMiddleware_1.requireRole)(['STUDENT']), sessionController_1.createSession);
router.get('/my', (0, authMiddleware_1.requireRole)(['STUDENT']), sessionController_1.getMySessions);
router.put('/:id/reschedule', (0, authMiddleware_1.requireRole)(['STUDENT']), sessionController_1.rescheduleSession);
router.delete('/:id', (0, authMiddleware_1.requireRole)(['STUDENT']), sessionController_1.deleteSession);
router.get('/:id/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        // Verify access
        const session = yield prisma_1.default.session.findUnique({ where: { id: Number(id) } });
        if (!session || (session.student_id !== userId && session.counselor_id !== userId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const chatSession = yield prisma_1.default.chatSession.findUnique({
            where: { session_id: Number(id) },
            include: {
                messages: {
                    include: { sender: { select: { full_name: true } } },
                    orderBy: { sent_at: 'asc' }
                }
            }
        });
        res.json((chatSession === null || chatSession === void 0 ? void 0 : chatSession.messages) || []);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching chat history' });
    }
}));
exports.default = router;
