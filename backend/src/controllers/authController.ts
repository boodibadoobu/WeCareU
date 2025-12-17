import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export const registerStudent = async (req: Request, res: Response) => {
    const { full_name, nim, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        res.status(400).json({ message: 'Passwords do not match' });
        return;
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ nim }, { full_name }] } // Simple check, ideally check nim specifically
        });

        if (existingUser) {
            res.status(400).json({ message: 'User with this NIM or name already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                full_name,
                nim,
                email: email || null, // Email is optional
                role: 'STUDENT',
                password_hash: hashedPassword,
                status: 'PENDING' // Students need admin approval before login
            }
        });

        res.status(201).json({ message: 'Registration successful! Please wait for admin approval before you can login.', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body; // identifier can be NIM (student) or Email (counselor/admin)

    try {
        const user = await prisma.user.findFirst({
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

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    // Stateless JWT, client just drops token. 
    // Optionally blacklist here if we had Redis.
    res.json({ message: 'Logged out successfully' });
};
