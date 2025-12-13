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
exports.getStudentResults = exports.deleteStressTest = exports.updateStressTest = exports.getStressTestById = exports.getMyResults = exports.submitTest = exports.getQuestions = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get Questions
const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield prisma_1.default.stressQuestion.findMany();
        res.json(questions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
});
exports.getQuestions = getQuestions;
// Submit Test (CREATE)
const submitTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
            answers.forEach((a) => totalScore += a.answer_value);
        }
        // Simple categorization logic
        let category = 'NORMAL';
        if (totalScore > 10)
            category = 'RINGAN';
        if (totalScore > 20)
            category = 'SEDANG';
        if (totalScore > 30)
            category = 'BERAT';
        const test = yield prisma_1.default.stressTest.create({
            data: {
                student_id: userId,
                total_score: totalScore,
                category: category,
                scale_name: 'DASS-21 Simplified',
                answers: {
                    create: answers.map((a) => ({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test', error: String(error) });
    }
});
exports.submitTest = submitTest;
// Get My Results (READ)
const getMyResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const results = yield prisma_1.default.stressTest.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
});
exports.getMyResults = getMyResults;
// Get Single Stress Test by ID (READ)
const getStressTestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const test = yield prisma_1.default.stressTest.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stress test' });
    }
});
exports.getStressTestById = getStressTestById;
// UPDATE - Update Stress Test Result
const updateStressTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const existingTest = yield prisma_1.default.stressTest.findFirst({
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
        answers.forEach((a) => totalScore += a.answer_value);
        // Recalculate category
        let category = 'NORMAL';
        if (totalScore > 10)
            category = 'RINGAN';
        if (totalScore > 20)
            category = 'SEDANG';
        if (totalScore > 30)
            category = 'BERAT';
        // Delete old answers and create new ones
        yield prisma_1.default.stressTestAnswer.deleteMany({
            where: { stress_test_id: Number(id) }
        });
        const updatedTest = yield prisma_1.default.stressTest.update({
            where: { id: Number(id) },
            data: {
                total_score: totalScore,
                category: category,
                answers: {
                    create: answers.map((a) => ({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating stress test', error: String(error) });
    }
});
exports.updateStressTest = updateStressTest;
// DELETE - Delete Stress Test
const deleteStressTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const test = yield prisma_1.default.stressTest.findFirst({
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
        yield prisma_1.default.stressTestAnswer.deleteMany({
            where: { stress_test_id: Number(id) }
        });
        // Delete stress test
        yield prisma_1.default.stressTest.delete({
            where: { id: Number(id) }
        });
        res.json({
            message: 'Stress test deleted successfully',
            deletedId: Number(id)
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting stress test', error: String(error) });
    }
});
exports.deleteStressTest = deleteStressTest;
// Get Student Results (For Counselor)
const getStudentResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    if (!studentId || isNaN(Number(studentId))) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: ['Invalid student ID']
        });
    }
    try {
        const results = yield prisma_1.default.stressTest.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching student results' });
    }
});
exports.getStudentResults = getStudentResults;
