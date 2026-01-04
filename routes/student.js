// Student Routes
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyStudent } = require('../middleware/auth');

// All routes require student authentication
router.get('/dashboard', verifyStudent, studentController.getDashboard);
router.get('/certificates', verifyStudent, studentController.getCertificates);
router.get('/certificates/:certificateId', verifyStudent, studentController.getCertificateDetails);
router.get('/certificates/:certificateId/verify', verifyStudent, studentController.verifyCertificateOnBlockchain);

module.exports = router;
