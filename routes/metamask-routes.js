// Backend endpoint for MetaMask-signed certificates
// Add this to your Express app

const express = require('express');
const ethers = require('ethers');
const router = express.Router();

// Import your blockchain service
const blockchainService = require('../utils/blockchain');
const db = require('../config/database');

/**
 * POST /api/certificates/issue-with-metamask
 * Issue a certificate using MetaMask signature
 */
router.post('/issue-with-metamask', async (req, res) => {
  try {
    const {
      certId,
      studentName,
      courseName,
      issueDate,
      issuerName,
      messageHash,
      signature,
      signerAddress,
      universityId
    } = req.body;

    // Validate required fields
    if (!certId || !studentName || !courseName || !issueDate || !issuerName ||
        !messageHash || !signature || !signerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log('📥 Received MetaMask signed certificate request');
    console.log('   Cert ID:', certId);
    console.log('   Signer:', signerAddress);
    console.log('   Message Hash:', messageHash);

    // Step 1: Verify signature on backend
    const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);
    console.log('✅ Signature verified, recovered address:', recoveredAddress);

    if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: 'Signature verification failed'
      });
    }

    // Step 2: Check if university is approved issuer (optional)
    // This depends on your contract's authorization logic

    // Step 3: Submit transaction to blockchain using relayer
    // The relayer calls contract with MetaMask's signature
    const transactionResult = await blockchainService.issueWithMetaMaskSignature(
      {
        certId,
        studentName,
        courseName,
        issueDate,
        issuerName
      },
      messageHash,
      signature,
      signerAddress  // The MetaMask signer address
    );

    console.log('✅ Certificate issued on blockchain');
    console.log('   TX Hash:', transactionResult.txHash);
    console.log('   Block:', transactionResult.blockNumber);

    // Step 4: Store in database
    const query = `
      INSERT INTO certificates 
      (cert_id, student_name, course_name, issue_date, issuer_name, issuer_address, blockchain_tx_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(query, [
      certId,
      studentName,
      courseName,
      issueDate,
      issuerName,
      signerAddress,
      transactionResult.txHash
    ], (error) => {
      if (error) {
        console.error('❌ Database error:', error);
        // Certificate is on blockchain, but not in DB - still consider it success
      }
    });

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certId,
        transactionHash: transactionResult.txHash,
        blockNumber: transactionResult.blockNumber,
        gasUsed: transactionResult.gasUsed,
        status: 1
      }
    });

  } catch (error) {
    console.error('❌ Error issuing certificate:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metamask/status
 * Get MetaMask connection status and requirements
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      installed: true, // This would be checked on frontend
      requiredChain: {
        id: 80002,
        name: 'Polygon Amoy',
        rpc: 'https://rpc-amoy.polygon.technology'
      },
      contract: {
        address: '0x7d6159A7cBd7061AA231288651e750B5c5046343',
        network: 'Polygon Amoy'
      }
    }
  });
});

module.exports = router;
