import express from 'express';
import { signup, loginUser, getMe } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
