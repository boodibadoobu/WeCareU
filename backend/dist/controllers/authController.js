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
exports.logout = exports.login = exports.registerStudent = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const registerStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, nim, password, confirm_password } = req.body;
    if (password !== confirm_password) {
        res.status(400).json({ message: 'Passwords do not match' });
        return;
    }
    try {
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { OR: [{ nim }, { full_name }] } // Simple check, ideally check nim specifically
        });
        if (existingUser) {
            res.status(400).json({ message: 'User with this NIM or name already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                full_name,
                nim,
                role: 'STUDENT',
                password_hash: hashedPassword,
                status: 'PENDING' // Students might need verification too, or auto-active. Spec says "Admin - Verifikasi akun konselor & mahasiswa", so PENDING.
            }
        });
        res.status(201).json({ message: 'Registration successful. Please wait for admin verification.', userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.registerStudent = registerStudent;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body; // identifier can be NIM (student) or Email (counselor/admin)
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { nim: identifier },
                    { email: identifier }
                ]
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (user.status !== 'ACTIVE') {
            res.status(403).json({ message: 'Account is not active. Status: ' + user.status });
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, name: user.full_name }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.full_name,
                role: user.role,
                nim: user.nim,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const logout = (req, res) => {
    // Stateless JWT, client just drops token. 
    // Optionally blacklist here if we had Redis.
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
