const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

// Public verification endpoints (no auth)
router.get('/certificate/:certificateId', verifyController.verifyByCertificateId);
router.get('/user/:userId', verifyController.listByUserId);

module.exports = router;
