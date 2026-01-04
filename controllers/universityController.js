// University Controller - Registration, login, certificate issuance
const Institute = require('../models/Institute');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../utils/blockchain');
const { ethers } = require('ethers');

// Simple Ethereum address validation
function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Register new institute
exports.registerInstitute = async (req, res) => {
  try {
    const { institute_name, email, password, wallet_address } = req.body;

    // Validation
    if (!institute_name || !email || !password || !wallet_address) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Wallet validation (basic check)
    if (!isValidEthAddress(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format (must be 0x followed by 40 hex characters)' });
    }

    // Check if email exists
    const emailExists = await Institute.emailExists(email);
    if (emailExists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if wallet exists
    const walletExists = await Institute.walletExists(wallet_address);
    if (walletExists) {
      return res.status(409).json({ error: 'Wallet already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create institute
    const institute = await Institute.create(
      institute_name,
      wallet_address,
      email,
      password_hash
    );

    // Generate JWT
    const token = jwt.sign(
      {
        institute_id: institute.institute_id,
        email: institute.email,
        role: 'university'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Institute registered successfully. Awaiting admin approval.',
      token,
      institute: {
        institute_id: institute.institute_id,
        institute_name: institute.name,
        email: institute.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login institute
exports.loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find institute
    const institute = await Institute.findByEmail(email);
    if (!institute) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if approved
    if (institute.verification_status !== 'approved') {
      return res.status(403).json({ 
        error: `Institute not approved. Status: ${institute.verification_status}` 
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, institute.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        institute_id: institute.institute_id,
        email: institute.email,
        role: 'university'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      institute: {
        institute_id: institute.institute_id,
        institute_name: institute.institute_name,
        email: institute.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get institute profile
exports.getProfile = async (req, res) => {
  try {
    const institute = await Institute.findById(req.user.institute_id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    res.json({
      institute: {
        institute_id: institute.institute_id,
        institute_name: institute.institute_name,
        email: institute.email,
        wallet_address: institute.wallet_address,
        verification_status: institute.verification_status,
        created_at: institute.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get institute dashboard
exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await Institute.getDashboard(req.user.institute_id);
    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Issue single certificate
exports.issueCertificate = async (req, res) => {
  try {
    const { student_id, course_name, grade } = req.body;

    if (!student_id || !course_name || !grade) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if student exists
    const studentQuery = 'SELECT full_name FROM students WHERE user_id = ?';
    const [studentRows] = await db.execute(studentQuery, [student_id]);
    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const certificate_id = 'CERT' + Date.now() + uuidv4().substring(0, 8);
    const issued_date = new Date().toISOString().split('T')[0];

    // Get university name
    const institute = await db.execute(
      'SELECT institute_name FROM institutes WHERE institute_id = ?',
      [req.user.institute_id]
    );
    const issuerName = institute[0][0]?.institute_name || 'Unknown';

    // Issue on blockchain
    console.log(`\n📝 Issuing certificate to blockchain...`);
    const blockchainResult = await blockchain.issueCertificate(
      certificate_id,
      studentRows[0].full_name,
      course_name,
      issued_date,
      issuerName
    );

    if (!blockchainResult.success) {
      return res.status(500).json({
        error: 'Failed to issue certificate on blockchain',
        details: blockchainResult.error
      });
    }

    // Insert certificate with blockchain hash
    const query = `
      INSERT INTO certificates 
      (certificate_id, user_id, institute_id, certificate_title, course, issued_date, grade, blockchain_tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      certificate_id ?? null,
      student_id ?? null,
      req.user.institute_id ?? null,
      course_name ?? null,
      course_name ?? null,
      issued_date ?? null,
      grade ?? null,
      blockchainResult.transactionHash ?? null
    ]);

    res.status(201).json({
      message: 'Certificate issued successfully on blockchain!',
      certificate: {
        certificate_id,
        student_id,
        course_name,
        grade,
        issued_date,
        blockchain: {
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed
        },
        status: 'Confirmed on Polygon Amoy'
      }
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Prepare payload for MetaMask signing (university signs, relayer sends)
exports.getCertificateSignaturePayload = async (req, res) => {
  try {
    const { student_id, course_name, grade } = req.body;

    if (!student_id || !course_name || !grade) {
      return res.status(400).json({ error: 'student_id, course_name, grade are required' });
    }

    // Fetch student
    const [studentRows] = await db.execute('SELECT full_name FROM students WHERE user_id = ?', [student_id]);
    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch institute info
    const [instRows] = await db.execute(
      'SELECT institute_name, wallet_address FROM institutes WHERE institute_id = ?',
      [req.user.institute_id]
    );
    if (instRows.length === 0) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    const signerAddress = instRows[0].wallet_address;
    if (!signerAddress) {
      return res.status(400).json({ error: 'Institute wallet not configured' });
    }

    const certificate_id = 'CERT' + Date.now() + uuidv4().substring(0, 8);
    const issued_date = new Date().toISOString().split('T')[0];
    const issuerName = instRows[0].institute_name || 'Unknown';

    const certData = {
      certId: certificate_id,
      studentName: studentRows[0].full_name,
      courseName: course_name,
      issueDate: issued_date,
      issuerName
    };

    // Compute hash for MetaMask signing (no nonce)
    const { messageHash } = await blockchain.computeCertificateHash(certData, signerAddress);

    res.json({
      success: true,
      certificate_id,
      issued_date,
      signer_address: signerAddress,
      message_hash: messageHash,
      certData
    });
  } catch (error) {
    console.error('Signature payload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Issue certificate using MetaMask signature (university signs, relayer submits)
exports.issueCertificateWithSignature = async (req, res) => {
  try {
    const {
      certificate_id,
      student_id,
      course_name,
      grade,
      issued_date,
      signature,
      signer_address,
      message_hash
    } = req.body;

    if (!certificate_id || !student_id || !course_name || !grade || !issued_date || !signature || !signer_address || !message_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch student
    const [studentRows] = await db.execute('SELECT full_name FROM students WHERE user_id = ?', [student_id]);
    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch institute info and enforce signer match
    const [instRows] = await db.execute(
      'SELECT institute_name, wallet_address FROM institutes WHERE institute_id = ?',
      [req.user.institute_id]
    );
    if (instRows.length === 0) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    const signerAddress = instRows[0].wallet_address;
    if (!signerAddress) {
      return res.status(400).json({ error: 'Institute wallet not configured' });
    }

    if (signerAddress.toLowerCase() !== signer_address.toLowerCase()) {
      return res.status(400).json({ error: 'Signer address does not match institute wallet' });
    }

    const certData = {
      certId: certificate_id,
      studentName: studentRows[0].full_name,
      courseName: course_name,
      issueDate: issued_date,
      issuerName: instRows[0].institute_name || 'Unknown'
    };

    // Recompute hash to ensure it matches client-provided message_hash
    const { messageHash: contractHash } = await blockchain.computeCertificateHash(certData, signerAddress);
    if (contractHash.toLowerCase() !== message_hash.toLowerCase()) {
      return res.status(400).json({ error: 'Message hash mismatch. Please re-sign.' });
    }

    // Relay the signed payload
    const txResult = await blockchain.issueWithMetaMaskSignature(
      certData,
      message_hash,
      signature,
      signerAddress
    );

    // Persist certificate with blockchain hash
    const insertQuery = `
      INSERT INTO certificates 
      (certificate_id, user_id, institute_id, certificate_title, course, issued_date, grade, blockchain_tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(insertQuery, [
      certificate_id ?? null,
      student_id ?? null,
      req.user.institute_id ?? null,
      course_name ?? null,
      course_name ?? null,
      issued_date ?? null,
      grade ?? null,
      txResult.txHash ?? null
    ]);

    res.status(201).json({
      message: 'Certificate issued successfully (MetaMask-signed, relayer-submitted)',
      certificate: {
        certificate_id,
        student_id,
        course_name,
        grade,
        issued_date,
        blockchain: {
          transactionHash: txResult.txHash,
          blockNumber: txResult.blockNumber,
          gasUsed: txResult.gasUsed,
          status: txResult.status
        },
        status: 'Confirmed on Polygon Amoy'
      }
    });
  } catch (error) {
    console.error('Issue certificate (signature) error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate a bulk authorization hash (one signature reused across many certs)
exports.getBulkAuthorizationMessage = async (req, res) => {
  try {
    console.log('📬 getBulkAuthorizationMessage called');
    const { certificate_count } = req.body;
    const count = Number(certificate_count || 0);
    console.log('   certificate_count:', certificate_count, '-> count:', count);
    
    if (!count || count < 1) {
      return res.status(400).json({ error: 'certificate_count must be >= 1' });
    }

    // expiry 1 hour from now; batchId = Date.now()
    const batchId = Date.now();
    const expiry = Math.floor(Date.now() / 1000) + 3600;

    console.log('   batchId:', batchId, typeof batchId);
    console.log('   expiry:', expiry, typeof expiry);

    // signer is the institute wallet
    const [instRows] = await db.execute(
      'SELECT wallet_address FROM institutes WHERE institute_id = ?',
      [req.user.institute_id]
    );
    if (instRows.length === 0 || !instRows[0].wallet_address) {
      return res.status(400).json({ error: 'Institute wallet not configured' });
    }
    const signer = instRows[0].wallet_address;
    console.log('   signer:', signer);

    // authHash = keccak256("BULK_AUTH", signer, batchId, count, expiry)
    console.log('🔐 Computing auth hash...');
    console.log('   Input: BULK_AUTH, address, uint256, uint256, uint256');
    console.log('   Values:', 'BULK_AUTH', signer, batchId, count, expiry);
    
    const authHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256', 'uint256'],
      ['BULK_AUTH', signer, batchId, count, expiry]
    );
    
    console.log('✓ Auth hash computed:', authHash);
    console.log('   Length:', authHash.length);
    console.log('   Starts with 0x:', authHash.startsWith('0x'));

    res.json({
      success: true,
      auth_hash: authHash,
      batch_id: batchId,
      certificate_count: count,
      expiry
    });
  } catch (error) {
    console.error('❌ Bulk auth message error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Bulk issue using single authorization signature (contract bulk auth)
exports.bulkIssueWithSingleSignature = async (req, res) => {
  try {
    console.log('\n========== BULK ISSUE START ==========');
    console.log('🔍 Bulk issue request received');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const { certificates, auth_hash, auth_signature, signer_address, batch_id, certificate_count, expiry } = req.body;

    console.log('📦 Raw params extracted:');
    console.log('   certificates:', Array.isArray(certificates) ? `Array(${certificates.length})` : typeof certificates);
    console.log('   auth_hash:', auth_hash, `(${typeof auth_hash}, length: ${auth_hash?.length || 'N/A'})`);
    console.log('   auth_signature:', auth_signature, `(${typeof auth_signature}, length: ${auth_signature?.length || 'N/A'})`);
    console.log('   signer_address:', signer_address, `(${typeof signer_address})`);
    console.log('   batch_id:', batch_id, `(${typeof batch_id})`);
    console.log('   certificate_count:', certificate_count, `(${typeof certificate_count})`);
    console.log('   expiry:', expiry, `(${typeof expiry})`);

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ error: 'certificates array required' });
    }
    if (!auth_hash || !auth_signature || !signer_address || batch_id === undefined || certificate_count === undefined || expiry === undefined) {
      console.error('❌ Missing required parameters');
      return res.status(400).json({ error: 'auth_hash, auth_signature, signer_address, batch_id, certificate_count, expiry are required' });
    }

    // Validate auth_hash and auth_signature are valid hex strings
    if (typeof auth_hash !== 'string' || !auth_hash.startsWith('0x')) {
      console.error('❌ auth_hash is not a valid hex string:', auth_hash);
      return res.status(400).json({ error: `auth_hash must be a valid hex string, received: ${typeof auth_hash}` });
    }
    if (typeof auth_signature !== 'string' || !auth_signature.startsWith('0x')) {
      console.error('❌ auth_signature is not a valid hex string:', auth_signature);
      return res.status(400).json({ error: `auth_signature must be a valid hex string, received: ${typeof auth_signature}` });
    }

    // Convert to proper types for contract
    const batchIdNum = Number(batch_id);
    const certCountNum = Number(certificate_count);
    const expiryNum = Number(expiry);

    console.log('🔄 Converted numeric params:');
    console.log('   batchIdNum:', batchIdNum, `(isNaN: ${isNaN(batchIdNum)})`);
    console.log('   certCountNum:', certCountNum, `(isNaN: ${isNaN(certCountNum)})`);
    console.log('   expiryNum:', expiryNum, `(isNaN: ${isNaN(expiryNum)})`);

    if (isNaN(batchIdNum) || isNaN(certCountNum) || isNaN(expiryNum)) {
      console.error('❌ Failed to convert numeric parameters');
      return res.status(400).json({ error: 'batch_id, certificate_count, and expiry must be valid numbers' });
    }

    // Verify signer matches institute wallet
    const [instRows] = await db.execute(
      'SELECT institute_name, wallet_address FROM institutes WHERE institute_id = ?',
      [req.user.institute_id]
    );
    if (instRows.length === 0) {
      return res.status(404).json({ error: 'Institute not found' });
    }
    const instituteWallet = instRows[0].wallet_address;
    if (!instituteWallet) {
      return res.status(400).json({ error: 'Institute wallet not configured' });
    }
    console.log('✓ Institute wallet:', instituteWallet);
    console.log('✓ Signer address:', signer_address);
    
    if (instituteWallet.toLowerCase() !== signer_address.toLowerCase()) {
      return res.status(400).json({ error: 'Signer address does not match institute wallet' });
    }

    // Recompute expected auth hash and compare
    console.log('🔐 Verifying auth hash...');
    try {
      // Ensure all values are in correct format before using ethers
      if (!signer_address || typeof signer_address !== 'string') {
        throw new Error(`Invalid signer_address: ${signer_address} (${typeof signer_address})`);
      }
      if (typeof batchIdNum !== 'number' || isNaN(batchIdNum)) {
        throw new Error(`Invalid batchIdNum: ${batchIdNum}`);
      }
      if (typeof certCountNum !== 'number' || isNaN(certCountNum)) {
        throw new Error(`Invalid certCountNum: ${certCountNum}`);
      }
      if (typeof expiryNum !== 'number' || isNaN(expiryNum)) {
        throw new Error(`Invalid expiryNum: ${expiryNum}`);
      }
      
      console.log('   Input validation passed');
      console.log('   BULK_AUTH params: string, address, uint256, uint256, uint256');
      console.log('   Values: BULK_AUTH,', signer_address, batchIdNum, certCountNum, expiryNum);
      
      const expectedAuthHash = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256', 'uint256', 'uint256'],
        ['BULK_AUTH', signer_address, batchIdNum, certCountNum, expiryNum]
      );
      console.log('   Expected:', expectedAuthHash);
      console.log('   Received:', auth_hash);
      if (expectedAuthHash.toLowerCase() !== auth_hash.toLowerCase()) {
        return res.status(400).json({ error: 'auth_hash mismatch' });
      }
    } catch (hashError) {
      console.error('❌ Error computing auth hash:', hashError.message);
      console.error('Stack:', hashError.stack);
      return res.status(400).json({ error: `Hash computation failed: ${hashError.message}` });
    }

    // Verify signature recovers signer (EIP-191)
    console.log('✍️ Verifying signature...');
    try {
      const messageHash = ethers.utils.hashMessage(ethers.utils.arrayify(auth_hash));
      console.log('   Message hash:', messageHash);
      const recovered = ethers.utils.recoverAddress(messageHash, auth_signature);
      console.log('   Recovered:', recovered);
      console.log('   Expected:', signer_address);
      if (recovered.toLowerCase() !== signer_address.toLowerCase()) {
        return res.status(400).json({ error: 'Signature does not recover signer_address' });
      }
    } catch (sigError) {
      console.error('❌ Signature verification error:', sigError.message);
      return res.status(400).json({ error: `Signature verification failed: ${sigError.message}` });
    }

    // Expiry check client-side to fail fast
    const now = Math.floor(Date.now() / 1000);
    if (now > expiryNum) {
      return res.status(400).json({ error: 'Authorization expired' });
    }

    const results = [];
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      const {
        certificate_id,
        student_id,
        course_name,
        grade,
        issued_date,
        student_name // optional; if missing we fetch by student_id
      } = cert;

      // Validate required fields
      if (!certificate_id || !course_name || !issued_date) {
        results.push({ index: i, certificate_id, success: false, error: 'Missing required fields (certificate_id, course_name, issued_date)' });
        continue;
      }

      try {
        // Get student name - either from payload or database
        let studentName = student_name;
        if (!studentName && student_id) {
          const [sRows] = await db.execute('SELECT full_name FROM students WHERE user_id = ?', [student_id]);
          if (sRows.length === 0) {
            results.push({ index: i, certificate_id, success: false, error: 'Student not found' });
            continue;
          }
          studentName = sRows[0].full_name;
        }
        
        // If still no student name, use a placeholder
        if (!studentName) {
          studentName = 'Unknown Student';
        }

        const certData = {
          certId: certificate_id,
          studentName,
          courseName: course_name,
          issueDate: issued_date,
          issuerName: instRows[0].institute_name || 'Unknown'
        };

        // Relay using bulk auth (one signature reused)
        const txResult = await blockchain.issueWithBulkAuth(
          certData,
          auth_hash,
          auth_signature,
          signer_address,
          batchIdNum,
          certCountNum,
          expiryNum
        );

        // Persist
        const insertQuery = `
          INSERT INTO certificates 
          (certificate_id, user_id, institute_id, certificate_title, course, issued_date, grade, blockchain_tx_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(insertQuery, [
          certificate_id ?? null,
          student_id ?? null,
          req.user.institute_id ?? null,
          course_name ?? null,
          course_name ?? null,
          issued_date ?? null,
          grade ?? null,
          txResult.txHash ?? null
        ]);

        results.push({
          index: i,
          certificate_id,
          success: true,
          transactionHash: txResult.txHash,
          blockNumber: txResult.blockNumber,
          gasUsed: txResult.gasUsed,
          status: txResult.status
        });
      } catch (err) {
        results.push({ index: i, certificate_id, success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      total: certificates.length,
      results
    });
  } catch (error) {
    console.error('❌ Bulk issue (single sig) error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Get institute certificates
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Institute.getCertificates(req.user.institute_id);
    res.json({
      total: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Bulk upload certificates via CSV
exports.bulkIssueCertificates = async (req, res) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ error: 'Certificates array required' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < certificates.length; i++) {
      try {
        const { student_id, course_name, grade } = certificates[i];

        if (!student_id || !course_name || !grade) {
          errors.push({
            index: i,
            error: 'Missing required fields (student_id, course_name, grade)'
          });
          continue;
        }

        // Check if student exists
        const studentQuery = 'SELECT full_name FROM students WHERE user_id = ?';
        const [studentRows] = await db.execute(studentQuery, [student_id]);
        if (studentRows.length === 0) {
          errors.push({
            index: i,
            error: `Student ${student_id} not found`
          });
          continue;
        }

        const certificate_id = 'CERT' + Date.now() + uuidv4().substring(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
        const issued_date = new Date().toISOString().split('T')[0];

        // Insert certificate
        const query = `
          INSERT INTO certificates 
          (certificate_id, user_id, institute_id, certificate_title, course, issued_date, grade, blockchain_tx_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [
          certificate_id,
          student_id,
          req.user.institute_id,
          course_name,
          course_name,
          issued_date,
          grade,
          'pending_blockchain'
        ]);

        results.push({
          index: i,
          certificate_id,
          student_id,
          course_name,
          grade,
          status: 'Success'
        });
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Bulk upload processed',
      total: certificates.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: error.message });
  }
};
