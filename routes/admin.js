// Admin Routes - Login, approve/reject universities
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Public route
router.post('/login', adminController.login);

// Protected routes (require admin authentication)
router.get('/profile', verifyToken, verifyAdmin, adminController.getProfile);
router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboard);

// Institute management
router.get('/institutes', verifyToken, verifyAdmin, adminController.getAllInstitutes);
router.get('/institutes/pending', verifyToken, verifyAdmin, adminController.getPendingInstitutes);
router.get('/institutes/:institute_id/issuer-status', verifyToken, verifyAdmin, adminController.getIssuerStatus);
router.post('/institutes/:institute_id/approve', verifyToken, verifyAdmin, adminController.approveInstitute);
router.post('/institutes/:institute_id/reject', verifyToken, verifyAdmin, adminController.rejectInstitute);
router.post('/institutes/:institute_id/revoke', verifyToken, verifyAdmin, adminController.revokeInstitute);

// Statistics
router.get('/statistics', verifyToken, verifyAdmin, adminController.getStatistics);

// Blockchain status
router.get('/blockchain/status', verifyToken, verifyAdmin, adminController.getBlockchainStatus);

module.exports = router;
