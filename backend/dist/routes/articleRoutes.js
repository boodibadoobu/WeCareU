"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public Read Access (Authenticated Users)
router.get('/', authMiddleware_1.authenticateToken, articleController_1.getArticles);
router.get('/:id', authMiddleware_1.authenticateToken, articleController_1.getArticleById);
// Admin/Counselor Write Access
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN', 'COUNSELOR']), articleController_1.createArticle);
router.put('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN', 'COUNSELOR']), articleController_1.updateArticle);
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN', 'COUNSELOR']), articleController_1.deleteArticle);
exports.default = router;
