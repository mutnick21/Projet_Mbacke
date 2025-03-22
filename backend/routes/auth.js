// routes/auth.js
import express from 'express';
import * as authController from '../controllers/authController.js';
// import { protect, authorize, checkGroupMembership } from '../middleware/auth.js';
const router = express.Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Routes protégées
// router.use(protect);

// router.get('/me', authController.getMe);
// router.patch('/update-password', authController.updatePassword);
// router.get('/logout', authController.logout);

// Exportation en utilisant la syntaxe ES
export default router;