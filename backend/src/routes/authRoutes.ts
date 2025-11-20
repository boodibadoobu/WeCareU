import { Router } from 'express';
import { registerStudent, login, logout } from '../controllers/authController';

const router = Router();

router.post('/register-student', registerStudent);
router.post('/login', login);
router.post('/logout', logout);

export default router;
