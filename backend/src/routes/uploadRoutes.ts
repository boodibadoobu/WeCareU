import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadImage } from '../controllers/uploadController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Upload image - only for counselors and admins
router.post('/image', authenticateToken, requireRole(['COUNSELOR', 'ADMIN']), upload.single('image'), uploadImage);

export default router;
