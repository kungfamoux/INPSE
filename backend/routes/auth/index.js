import express from 'express';
import { login, register, getProfile, logout } from './authController.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;
