const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  handleValidation,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validate');

const router = express.Router();

// Stricter rate limit on auth endpoints to slow down brute force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerRules, handleValidation, authController.register);
router.post('/login', authLimiter, loginRules, handleValidation, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, forgotPasswordRules, handleValidation, authController.forgotPassword);
router.patch('/reset-password/:token', resetPasswordRules, handleValidation, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

router.get('/me', protect, authController.getMe);
router.patch('/update-me', protect, authController.updateMe);
router.patch('/update-password', protect, authController.updatePassword);

module.exports = router;
