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
exports.deleteArticle = exports.updateArticle = exports.getArticleById = exports.getArticles = exports.createArticle = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Validation helper function
const validateArticleData = (title, content) => {
    const errors = [];
    // Validate title
    if (!title || title.trim() === '') {
        errors.push('Title cannot be empty');
    }
    else if (title.length < 5) {
        errors.push('Title must be at least 5 characters');
    }
    else if (title.length > 200) {
        errors.push('Title must not exceed 200 characters');
    }
    // Validate content
    if (!content || content.trim() === '') {
        errors.push('Content is required');
    }
    else if (content.length < 50) {
        errors.push('Content must be at least 50 characters');
    }
    return errors;
};
// Create Article
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, content, category, thumbnail_url } = req.body;
    const authorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    // Validate input
    const validationErrors = validateArticleData(title, content);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: validationErrors[0] });
    }
    try {
        const article = yield prisma_1.default.article.create({
            data: {
                title,
                content,
                category,
                thumbnail_url,
                author_id: authorId,
                is_published: true // Auto-publish for now
            }
        });
        res.status(201).json(article);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating article' });
    }
});
exports.createArticle = createArticle;
// Get All Articles
const getArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query;
    try {
        const whereClause = { is_published: true };
        // Add search functionality
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }
        const articles = yield prisma_1.default.article.findMany({
            where: whereClause,
            include: { author: { select: { id: true, full_name: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(articles);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching articles' });
    }
});
exports.getArticles = getArticles;
// Get Single Article
const getArticleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const article = yield prisma_1.default.article.findUnique({
            where: { id: Number(id) },
            include: { author: { select: { id: true, full_name: true } } }
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching article' });
    }
});
exports.getArticleById = getArticleById;
// Update Article
const updateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { title, content, category, thumbnail_url, is_published } = req.body;
    // Validate input
    const validationErrors = validateArticleData(title, content);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: validationErrors[0] });
    }
    try {
        // Check if article exists and get author info
        const existingArticle = yield prisma_1.default.article.findUnique({
            where: { id: Number(id) },
            select: { author_id: true }
        });
        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Authorization check: Only article author or ADMIN can update
        const isAuthor = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === existingArticle.author_id;
        const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN';
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const article = yield prisma_1.default.article.update({
            where: { id: Number(id) },
            data: { title, content, category, thumbnail_url, is_published }
        });
        res.json(article);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating article' });
    }
});
exports.updateArticle = updateArticle;
// Delete Article
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    try {
        // Check if article exists and get author info
        const existingArticle = yield prisma_1.default.article.findUnique({
            where: { id: Number(id) },
            select: { author_id: true }
        });
        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Authorization check: Only article author or ADMIN can delete
        const isAuthor = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === existingArticle.author_id;
        const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN';
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        yield prisma_1.default.article.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Article deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting article' });
    }
});
exports.deleteArticle = deleteArticle;
