import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Validation helper function
const validateArticleData = (title: string, content: string) => {
    const errors: string[] = [];

    // Validate title
    if (!title || title.trim() === '') {
        errors.push('Title cannot be empty');
    } else if (title.length < 5) {
        errors.push('Title must be at least 5 characters');
    } else if (title.length > 200) {
        errors.push('Title must not exceed 200 characters');
    }

    // Validate content
    if (!content || content.trim() === '') {
        errors.push('Content is required');
    } else if (content.length < 50) {
        errors.push('Content must be at least 50 characters');
    }

    return errors;
};

// Create Article
export const createArticle = async (req: Request, res: Response) => {
    const { title, content, category, thumbnail_url } = req.body;
    const authorId = req.user?.id;

    // Validate input
    const validationErrors = validateArticleData(title, content);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: validationErrors[0] });
    }

    try {
        const article = await prisma.article.create({
            data: {
                title,
                content,
                category,
                thumbnail_url,
                author_id: authorId!,
                is_published: true // Auto-publish for now
            }
        });
        res.status(201).json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating article' });
    }
};

// Get All Articles
export const getArticles = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const whereClause: any = { is_published: true };

        // Add search functionality
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const articles = await prisma.article.findMany({
            where: whereClause,
            include: { author: { select: { id: true, full_name: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles' });
    }
};

// Get Single Article
export const getArticleById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.findUnique({
            where: { id: Number(id) },
            include: { author: { select: { id: true, full_name: true } } }
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching article' });
    }
};

// Update Article
export const updateArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, category, thumbnail_url, is_published } = req.body;

    // Validate input
    const validationErrors = validateArticleData(title, content);
    if (validationErrors.length > 0) {
        return res.status(400).json({ message: validationErrors[0] });
    }

    try {
        // Check if article exists and get author info
        const existingArticle = await prisma.article.findUnique({
            where: { id: Number(id) },
            select: { author_id: true }
        });

        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Authorization check: Only article author or ADMIN can update
        const isAuthor = req.user?.id === existingArticle.author_id;
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const article = await prisma.article.update({
            where: { id: Number(id) },
            data: { title, content, category, thumbnail_url, is_published }
        });
        res.json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating article' });
    }
};

// Delete Article
export const deleteArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Check if article exists and get author info
        const existingArticle = await prisma.article.findUnique({
            where: { id: Number(id) },
            select: { author_id: true }
        });

        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Authorization check: Only article author or ADMIN can delete
        const isAuthor = req.user?.id === existingArticle.author_id;
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await prisma.article.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Article deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting article' });
    }
};
