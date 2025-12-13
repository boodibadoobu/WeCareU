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
exports.getDashboardStats = exports.createUser = exports.verifyUser = exports.getPendingUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Get Pending Users
const getPendingUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingUsers = yield prisma_1.default.user.findMany({
            where: { status: 'PENDING' },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                created_at: true,
                counselor_details: true
            }
        });
        res.json(pendingUsers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pending users' });
    }
});
exports.getPendingUsers = getPendingUsers;
// Verify User (Approve/Reject)
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'APPROVE' | 'REJECT'
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (action === 'APPROVE') {
            yield prisma_1.default.user.update({
                where: { id: Number(userId) },
                data: { status: 'ACTIVE' }
            });
        }
        else if (action === 'REJECT') {
            // Optionally delete or mark as suspended
            yield prisma_1.default.user.update({
                where: { id: Number(userId) },
                data: { status: 'SUSPENDED' }
            });
        }
        // Audit Log
        yield prisma_1.default.verificationAudit.create({
            data: {
                target_user_id: Number(userId),
                admin_id: adminId,
                action,
                reason
            }
        });
        res.json({ message: `User ${action}D successfully` });
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying user' });
    }
});
exports.verifyUser = verifyUser;
// Create User (Admin/Counselor)
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, email, password, role, specialization } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                full_name,
                email,
                password_hash: hashedPassword,
                role,
                status: 'ACTIVE',
                counselor_details: role === 'COUNSELOR' ? {
                    create: {
                        specialization: specialization || 'General',
                        years_experience: 0,
                        available_days: []
                    }
                } : undefined
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});
exports.createUser = createUser;
// Get Dashboard Stats
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalStudents, totalCounselors, pendingVerifications, totalSessions, completedSessions] = yield Promise.all([
            prisma_1.default.user.count({ where: { role: 'STUDENT' } }),
            prisma_1.default.user.count({ where: { role: 'COUNSELOR' } }),
            prisma_1.default.user.count({ where: { status: 'PENDING' } }),
            prisma_1.default.session.count(),
            prisma_1.default.session.count({ where: { status: 'COMPLETED' } })
        ]);
        res.json({
            totalStudents,
            totalCounselors,
            pendingVerifications,
            totalSessions,
            completedSessions
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});
exports.getDashboardStats = getDashboardStats;
