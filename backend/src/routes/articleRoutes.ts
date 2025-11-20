import { Router } from 'express';
import { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '../controllers/articleController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public Read Access (Authenticated Users)
router.get('/', authenticateToken, getArticles);
router.get('/:id', authenticateToken, getArticleById);

// Admin/Counselor Write Access
router.post('/', authenticateToken, requireRole(['ADMIN', 'COUNSELOR']), createArticle);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'COUNSELOR']), updateArticle);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'COUNSELOR']), deleteArticle);

export default router;
