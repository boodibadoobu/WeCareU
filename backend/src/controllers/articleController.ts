import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Create Article
export const createArticle = async (req: Request, res: Response) => {
    const { title, content, category, thumbnail_url } = req.body;
    const authorId = req.user?.id;

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
    try {
        const articles = await prisma.article.findMany({
            where: { is_published: true },
            include: { author: { select: { full_name: true } } },
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
            include: { author: { select: { full_name: true } } }
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

    try {
        const article = await prisma.article.update({
            where: { id: Number(id) },
            data: { title, content, category, thumbnail_url, is_published }
        });
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error updating article' });
    }
};

// Delete Article
export const deleteArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.article.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article' });
    }
};
