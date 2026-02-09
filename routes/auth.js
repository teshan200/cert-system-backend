// Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyStudent } = require('../middleware/auth');

// Student routes
router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);
router.get('/student/verify-email', authController.verifyStudentEmail);
router.post('/student/resend-verification', authController.resendStudentVerification);
router.get('/student/profile', verifyStudent, authController.getProfile);

module.exports = router;
