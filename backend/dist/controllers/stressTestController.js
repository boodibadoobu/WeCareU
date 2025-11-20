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
exports.getStudentResults = exports.getMyResults = exports.submitTest = exports.getQuestions = void 0;
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
// Submit Test
const submitTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { answers } = req.body; // Array of { question_id, answer_value }
    try {
        let totalScore = 0;
        if (answers && Array.isArray(answers)) {
            answers.forEach((a) => totalScore += a.answer_value);
        }
        // Simple categorization logic (Example)
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
            }
        });
        res.json(test);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test' });
    }
});
exports.submitTest = submitTest;
// Get My Results
const getMyResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const results = yield prisma_1.default.stressTest.findMany({
            where: { student_id: userId },
            orderBy: { taken_at: 'desc' }
        });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
});
exports.getMyResults = getMyResults;
// Get Student Results (For Counselor)
const getStudentResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    try {
        const results = yield prisma_1.default.stressTest.findMany({
            where: { student_id: Number(studentId) },
            orderBy: { taken_at: 'desc' }
        });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching student results' });
    }
});
exports.getStudentResults = getStudentResults;
