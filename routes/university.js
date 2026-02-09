// University Routes - Registration, login, certificate issuance
const express = require('express');
const router = express.Router();
const { verifyToken, verifyUniversity } = require('../middleware/auth');
const upload = require('../middleware/upload');
const universityController = require('../controllers/universityController');

// Public routes
router.post(
	'/register',
	upload.fields([
		{ name: 'logo', maxCount: 1 },
		{ name: 'verification_doc', maxCount: 1 }
	]),
	universityController.registerInstitute
);
router.post('/login', universityController.loginInstitute);
router.get('/verify-email', universityController.verifyInstituteEmail);
router.post('/resend-verification', universityController.resendInstituteVerification);

// Protected routes (require university authentication)
router.get('/profile', verifyToken, verifyUniversity, universityController.getProfile);
router.get('/dashboard', verifyToken, verifyUniversity, universityController.getDashboard);
router.get('/students/search', verifyToken, verifyUniversity, universityController.searchStudents);

// Certificate routes
router.post('/certificate/issue', verifyToken, verifyUniversity, universityController.issueCertificate);
router.post('/certificate/sign-payload', verifyToken, verifyUniversity, universityController.getCertificateSignaturePayload);
router.post('/certificate/issue-signed', verifyToken, verifyUniversity, universityController.issueCertificateWithSignature);
router.post('/certificate/bulk-auth', verifyToken, verifyUniversity, universityController.getBulkAuthorizationMessage);
router.post('/certificate/bulk-issue-signed', verifyToken, verifyUniversity, universityController.bulkIssueWithSingleSignature);
router.get('/certificates', verifyToken, verifyUniversity, universityController.getCertificates);
router.post('/certificates/bulk', verifyToken, verifyUniversity, universityController.bulkIssueCertificates);

module.exports = router;
