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
exports.createUser = exports.verifyUser = exports.getPendingUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get pending users
const getPendingUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            where: { status: 'PENDING' },
            select: { id: true, full_name: true, nim: true, email: true, role: true, created_at: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pending users' });
    }
});
exports.getPendingUsers = getPendingUsers;
// Verify user (Approve/Reject)
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'APPROVE' | 'REJECT'
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!adminId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const targetUser = yield prisma_1.default.user.findUnique({ where: { id: Number(id) } });
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        if (action === 'APPROVE') {
            yield prisma_1.default.user.update({
                where: { id: Number(id) },
                data: { status: 'ACTIVE' }
            });
        }
        else if (action === 'REJECT') {
            // Optionally delete or mark suspended
            yield prisma_1.default.user.update({
                where: { id: Number(id) },
                data: { status: 'SUSPENDED' }
            });
        }
        else {
            return res.status(400).json({ message: 'Invalid action' });
        }
        // Log audit
        yield prisma_1.default.verificationAudit.create({
            data: {
                target_user_id: Number(id),
                admin_id: adminId,
                action,
                reason
            }
        });
        res.json({ message: `User ${action}D successfully` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying user' });
    }
});
exports.verifyUser = verifyUser;
// Create Admin/Counselor (Seed or Admin Panel)
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, email, password, role, specialization } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                full_name,
                email,
                role, // ADMIN or COUNSELOR
                password_hash: hashedPassword,
                status: 'ACTIVE'
            }
        });
        if (role === 'COUNSELOR' && specialization) {
            yield prisma_1.default.counselorDetails.create({
                data: {
                    user_id: user.id,
                    specialization,
                    years_experience: 0,
                    available_days: []
                }
            });
        }
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});
exports.createUser = createUser;
