// University Routes - Registration, login, certificate issuance
const express = require('express');
const router = express.Router();
const { verifyToken, verifyUniversity } = require('../middleware/auth');
const universityController = require('../controllers/universityController');

// Public routes
router.post('/register', universityController.registerInstitute);
router.post('/login', universityController.loginInstitute);

// Protected routes (require university authentication)
router.get('/profile', verifyToken, verifyUniversity, universityController.getProfile);
router.get('/dashboard', verifyToken, verifyUniversity, universityController.getDashboard);

// Certificate routes
router.post('/certificate/issue', verifyToken, verifyUniversity, universityController.issueCertificate);
router.post('/certificate/sign-payload', verifyToken, verifyUniversity, universityController.getCertificateSignaturePayload);
router.post('/certificate/issue-signed', verifyToken, verifyUniversity, universityController.issueCertificateWithSignature);
router.post('/certificate/bulk-auth', verifyToken, verifyUniversity, universityController.getBulkAuthorizationMessage);
router.post('/certificate/bulk-issue-signed', verifyToken, verifyUniversity, universityController.bulkIssueWithSingleSignature);
router.get('/certificates', verifyToken, verifyUniversity, universityController.getCertificates);
router.post('/certificates/bulk', verifyToken, verifyUniversity, universityController.bulkIssueCertificates);

module.exports = router;
