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

// Submit Test (CREATE)
export const submitTest = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { answers } = req.body;

    // Validasi input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Answers array is required and cannot be empty']
        });
    }

    // Validasi setiap answer
    const validationErrors = [];
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (!answer.question_id) {
            validationErrors.push(`Answer ${i + 1}: question_id is required`);
        }
        if (answer.answer_value === undefined || answer.answer_value === null) {
            validationErrors.push(`Answer ${i + 1}: answer_value is required`);
        }
        if (typeof answer.answer_value !== 'number' || answer.answer_value < 0 || answer.answer_value > 3) {
            validationErrors.push(`Answer ${i + 1}: answer_value must be between 0 and 3`);
        }
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationErrors
        });
    }

    try {
        let totalScore = 0;
        if (answers && Array.isArray(answers)) {
            answers.forEach((a: any) => totalScore += a.answer_value);
        }

        // Simple categorization logic
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
            },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Stress test submitted successfully',
            data: test
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test', error: String(error) });
    }
};

// Get My Results (READ)
export const getMyResults = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const results = await prisma.stressTest.findMany({
            where: { student_id: userId },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: { taken_at: 'desc' }
        });

        res.json({
            message: 'Results fetched successfully',
            data: results,
            count: results.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};

// Get Single Stress Test by ID (READ)
export const getStressTestById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid stress test ID']
        });
    }

    try {
        const test = await prisma.stressTest.findFirst({
            where: {
                id: Number(id),
                student_id: userId
            },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!test) {
            return res.status(404).json({
                message: 'Stress test not found or you do not have permission to view it'
            });
        }

        res.json({
            message: 'Stress test fetched successfully',
            data: test
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stress test' });
    }
};

// UPDATE - Update Stress Test Result
export const updateStressTest = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { answers } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid stress test ID']
        });
    }

    // Validasi answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Answers array is required and cannot be empty']
        });
    }

    // Validasi setiap answer
    const validationErrors = [];
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (!answer.question_id) {
            validationErrors.push(`Answer ${i + 1}: question_id is required`);
        }
        if (answer.answer_value === undefined || answer.answer_value === null) {
            validationErrors.push(`Answer ${i + 1}: answer_value is required`);
        }
        if (typeof answer.answer_value !== 'number' || answer.answer_value < 0 || answer.answer_value > 3) {
            validationErrors.push(`Answer ${i + 1}: answer_value must be between 0 and 3`);
        }
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationErrors
        });
    }

    try {
        // Verify ownership
        const existingTest = await prisma.stressTest.findFirst({
            where: {
                id: Number(id),
                student_id: userId
            }
        });

        if (!existingTest) {
            return res.status(404).json({
                message: 'Stress test not found or you do not have permission to update it'
            });
        }

        // Calculate new total score
        let totalScore = 0;
        answers.forEach((a: any) => totalScore += a.answer_value);

        // Recalculate category
        let category: 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' = 'NORMAL';
        if (totalScore > 10) category = 'RINGAN';
        if (totalScore > 20) category = 'SEDANG';
        if (totalScore > 30) category = 'BERAT';

        // Delete old answers and create new ones
        await prisma.stressTestAnswer.deleteMany({
            where: { stress_test_id: Number(id) }
        });

        const updatedTest = await prisma.stressTest.update({
            where: { id: Number(id) },
            data: {
                total_score: totalScore,
                category: category,
                answers: {
                    create: answers.map((a: any) => ({
                        question_id: a.question_id,
                        answer_value: a.answer_value
                    }))
                }
            },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        });

        res.json({
            message: 'Stress test updated successfully',
            data: updatedTest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating stress test', error: String(error) });
    }
};

// DELETE - Delete Stress Test
export const deleteStressTest = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validasi ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid stress test ID']
        });
    }

    try {
        // Verify ownership
        const test = await prisma.stressTest.findFirst({
            where: {
                id: Number(id),
                student_id: userId
            }
        });

        if (!test) {
            return res.status(404).json({
                message: 'Stress test not found or you do not have permission to delete it'
            });
        }

        // Delete answers first (cascade)
        await prisma.stressTestAnswer.deleteMany({
            where: { stress_test_id: Number(id) }
        });

        // Delete stress test
        await prisma.stressTest.delete({
            where: { id: Number(id) }
        });

        res.json({
            message: 'Stress test deleted successfully',
            deletedId: Number(id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting stress test', error: String(error) });
    }
};

// Get Student Results (For Counselor)
export const getStudentResults = async (req: Request, res: Response) => {
    const { studentId } = req.params;

    if (!studentId || isNaN(Number(studentId))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid student ID']
        });
    }

    try {
        const results = await prisma.stressTest.findMany({
            where: { student_id: Number(studentId) },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        nim: true
                    }
                },
                answers: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: { taken_at: 'desc' }
        });

        res.json({
            message: 'Student results fetched successfully',
            data: results,
            count: results.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student results' });
    }
};


// ADMIN: Get All Questions (for management)
export const getAllQuestionsAdmin = async (req: Request, res: Response) => {
    try {
        const questions = await prisma.stressQuestion.findMany({
            orderBy: { id: 'asc' }
        });
        res.json({ message: 'Questions fetched successfully', data: questions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// ADMIN: Create Question
export const createQuestion = async (req: Request, res: Response) => {
    const { question_text, dimension } = req.body;
    if (!question_text || question_text.trim().length < 10) {
        return res.status(400).json({ message: 'Question text must be at least 10 characters' });
    }
    try {
        const question = await prisma.stressQuestion.create({
            data: { question_text: question_text.trim(), dimension: dimension || 'general' }
        });
        res.status(201).json({ message: 'Question created successfully', data: question });
    } catch (error) {
        res.status(500).json({ message: 'Error creating question' });
    }
};

// ADMIN: Update Question
export const updateQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { question_text, dimension } = req.body;
    if (question_text && question_text.trim().length < 10) {
        return res.status(400).json({ message: 'Question text must be at least 10 characters' });
    }
    try {
        const question = await prisma.stressQuestion.update({
            where: { id: Number(id) },
            data: { question_text: question_text?.trim(), dimension: dimension }
        });
        res.json({ message: 'Question updated successfully', data: question });
    } catch (error) {
        res.status(500).json({ message: 'Error updating question' });
    }
};

// ADMIN: Delete Question
export const deleteQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const answerCount = await prisma.stressTestAnswer.count({ where: { question_id: Number(id) } });
        if (answerCount > 0) {
            return res.status(400).json({ message: "Cannot delete question with existing answers" });
        }
        await prisma.stressQuestion.delete({ where: { id: Number(id) } });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
};
