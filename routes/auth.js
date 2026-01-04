// Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyStudent } = require('../middleware/auth');

// Student routes
router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);
router.get('/student/profile', verifyStudent, authController.getProfile);

module.exports = router;
