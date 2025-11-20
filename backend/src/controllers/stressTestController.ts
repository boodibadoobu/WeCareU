import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get Questions
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await prisma.stressQuestion.findMany();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Submit Test
export const submitTest = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { answers } = req.body; // Array of { question_id, answer_value }

    try {
        let totalScore = 0;
        if (answers && Array.isArray(answers)) {
            answers.forEach((a: any) => totalScore += a.answer_value);
        }

        // Simple categorization logic (Example)
        let category: 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' = 'NORMAL';
        if (totalScore > 10) category = 'RINGAN';
        if (totalScore > 20) category = 'SEDANG';
        if (totalScore > 30) category = 'BERAT';

        const test = await prisma.stressTest.create({
            data: {
                student_id: userId,
                total_score: totalScore,
                category: category,
                scale_name: 'DASS-21 Simplified',
                answers: {
                    create: answers.map((a: any) => ({
                        question_id: a.question_id,
                        answer_value: a.answer_value
                    }))
                }
            }
        });

        res.json(test);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test' });
    }
};

// Get My Results
export const getMyResults = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const results = await prisma.stressTest.findMany({
            where: { student_id: userId },
            orderBy: { taken_at: 'desc' }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};

// Get Student Results (For Counselor)
export const getStudentResults = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const results = await prisma.stressTest.findMany({
            where: { student_id: Number(studentId) },
            orderBy: { taken_at: 'desc' }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student results' });
    }
};
