// University Controller - Registration, login, certificate issuance
const Institute = require('../models/Institute');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../utils/blockchain');
const { ethers } = require('ethers');
const { sendEmail } = require('../utils/mailer');
const {
  createVerificationToken,
  hashToken,
  buildVerificationUrl,
  buildVerificationEmail,
  renderVerificationPage
} = require('../utils/emailVerification');

// Simple Ethereum address validation
function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

const isEmailVerificationRequired = () => process.env.REQUIRE_EMAIL_VERIFICATION !== 'false';

const sendInstituteVerificationEmail = async ({ name, email, token }) => {
  const verifyUrl = buildVerificationUrl('/api/university/verify-email', token);
  const { subject, html, text } = buildVerificationEmail({
    name,
    verifyUrl,
    roleLabel: 'institute'
  });
  await sendEmail({ to: email, subject, html, text });
};

const getFrontendBaseUrl = () => {
  const frontend = process.env.FRONTEND_URL;
  return frontend ? frontend.replace(/\/$/, '') : '';
};

const getPublicVerifyUrl = (certificateId) => {
  const frontendBase = getFrontendBaseUrl();
  if (frontendBase) {
    return `${frontendBase}/verify?certificateId=${encodeURIComponent(certificateId)}`;
  }
  const backend = process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`;
  return `${backend.replace(/\/$/, '')}/api/verify/certificate/${encodeURIComponent(certificateId)}`;
};

const getCertificateDownloadUrl = (certificateId) => {
  const frontendBase = getFrontendBaseUrl();
  if (frontendBase) {
    return `${frontendBase}/verify?certificateId=${encodeURIComponent(certificateId)}&download=1`;
  }
  return getPublicVerifyUrl(certificateId);
};

const getPortfolioUrl = (studentId) => {
  const frontendBase = getFrontendBaseUrl();
  if (!frontendBase || !studentId) {
    return '';
  }
  return `${frontendBase}/portfolio/${encodeURIComponent(studentId)}`;
};

const getEmailLogoUrl = () => {
  const logo = process.env.EMAIL_LOGO_URL;
  return logo ? logo.trim() : '';
};

const sendCertificateIssuedEmail = async ({
  to,
  studentName,
  studentId,
  certificateId,
  courseName,
  instituteName,
  issuedDate
}) => {
  const appName = process.env.APP_NAME || 'CertiChain';
  const verifyUrl = getPublicVerifyUrl(certificateId);
  const downloadUrl = getCertificateDownloadUrl(certificateId);
  const portfolioUrl = getPortfolioUrl(studentId);
  const logoUrl = getEmailLogoUrl();
  const subject = `${appName} - Your certificate has been issued`;
  const nameLine = studentName ? `Hi ${studentName},` : 'Hi,';
  const supportEmail = process.env.SUPPORT_EMAIL
    || `support@${appName.replace(/\s+/g, '').toLowerCase()}.com`;

  const portfolioButton = portfolioUrl
    ? `<a href="${portfolioUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">View Portfolio</a>`
    : '';

  const html = `
  <div style="background:#f5f6fb;padding:24px 0;font-family:'Segoe UI', Arial, sans-serif;color:#111827;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);padding:28px 32px;color:#fff;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <h1 style="margin:0;font-size:22px;letter-spacing:0.2px;">${appName}</h1>
                <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Certificate Issued</p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                ${logoUrl ? `<img src="${logoUrl}" alt="${appName}" style="height:28px;max-width:140px;object-fit:contain;"/>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 8px;">
          <h2 style="margin:0 0 8px;font-size:20px;">Congratulations!</h2>
          <p style="margin:0 0 16px;font-size:14.5px;line-height:1.6;">${nameLine}<br/>Your certificate is now live and ready to verify or download.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:#64748b;">Certificate ID</td>
                <td style="padding:6px 0;font-weight:600;color:#111827;">${certificateId}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Course</td>
                <td style="padding:6px 0;font-weight:600;color:#111827;">${courseName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Institute</td>
                <td style="padding:6px 0;font-weight:600;color:#111827;">${instituteName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Issued Date</td>
                <td style="padding:6px 0;font-weight:600;color:#111827;">${issuedDate}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="padding-bottom:12px;">
                <a href="${verifyUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Verify Certificate</a>
                <span style="display:inline-block;width:8px;"></span>
                <a href="${downloadUrl}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Download PDF</a>
                ${portfolioButton ? '<span style="display:inline-block;width:8px;"></span>' + portfolioButton : ''}
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#6b7280;line-height:1.5;">
                If the buttons do not work, copy and paste this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#6d28d9;word-break:break-all;">${verifyUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#0f172a;color:#e2e8f0;padding:18px 32px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>${appName} - Secure blockchain certificate verification</div>
            <div style="opacity:0.7;">Need help? ${supportEmail}</div>
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const text = `${nameLine}

Your certificate is now live.

Certificate ID: ${certificateId}
Course: ${courseName}
Institute: ${instituteName}
Issued Date: ${issuedDate}

Verify: ${verifyUrl}
Download: ${downloadUrl}${portfolioUrl ? `
Portfolio: ${portfolioUrl}` : ''}
`;
  await sendEmail({ to, subject, html, text });
};

// Register new institute
exports.registerInstitute = async (req, res) => {
  try {
    const { institute_name, email, password, wallet_address } = req.body;

    // File uploads
    const logoFile = req.files && req.files.logo ? req.files.logo[0] : null;
    const docFile = req.files && req.files.verification_doc ? req.files.verification_doc[0] : null;
    const logo_url = logoFile ? `/uploads/institutes/logos/${logoFile.filename}` : null;
    const verification_doc_url = docFile ? `/uploads/institutes/documents/${docFile.filename}` : null;

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
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Wallet validation (basic check)
    if (!isValidEthAddress(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format (must be 0x followed by 40 hex characters)' });
    }

    // Require verification document
    if (!verification_doc_url) {
      return res.status(400).json({ error: 'Verification document is required for approval' });
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
      password_hash,
      logo_url,
      verification_doc_url
    );

    const requiresVerification = isEmailVerificationRequired();
    if (requiresVerification) {
      const { token, tokenHash, expiresAt } = createVerificationToken();
      await Institute.setEmailVerification(institute.institute_id, tokenHash, expiresAt);

      let emailSent = true;
      try {
        await sendInstituteVerificationEmail({
          name: institute.name,
          email: institute.email,
          token
        });
      } catch (err) {
        console.error('Verification email error:', err.message);
        emailSent = false;
      }

      return res.status(201).json({
        message: emailSent
          ? 'Institute registered successfully. Verification email sent. Awaiting admin approval.'
          : 'Institute registered successfully. Verification email failed to send. Awaiting admin approval.',
        verification_required: true,
        email_sent: emailSent,
        institute: {
          institute_id: institute.institute_id,
          institute_name: institute.name,
          email: institute.email,
          logo_url,
          verification_doc_url
        }
      });
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

    res.status(201).json({
      message: 'Institute registered successfully. Awaiting admin approval.',
      token,
      institute: {
        institute_id: institute.institute_id,
        institute_name: institute.name,
        email: institute.email,
        logo_url,
        verification_doc_url
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

    if (isEmailVerificationRequired() && !institute.email_verified) {
      return res.status(403).json({
        error: 'Email not verified. Please check your inbox.',
        verification_required: true
      });
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
        logo_url: institute.logo_url || null,
        verification_doc_url: institute.verification_doc_url || null,
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
    console.log('Dashboard request - institute_id:', req.user.institute_id);
    const dashboard = await Institute.getDashboard(req.user.institute_id);
    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message, institute_id: req.user.institute_id });
  }
};

// Search students for autocomplete
exports.searchStudents = async (req, res) => {
  try {
    const rawQuery = (req.query.query || '').trim();
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(requestedLimit, 25) : 10;

    if (rawQuery.length < 3) {
      return res.json({ success: true, students: [] });
    }

    const like = `%${rawQuery}%`;
    const searchQuery = `
      SELECT user_id, full_name, email
      FROM students
      WHERE user_id LIKE ? OR full_name LIKE ? OR email LIKE ?
      ORDER BY full_name ASC
      LIMIT ${limit}
    `;

    const [rows] = await db.execute(searchQuery, [like, like, like]);

    res.json({
      success: true,
      students: rows
    });
  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({ error: 'Server error' });
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
    const studentQuery = 'SELECT full_name, email FROM students WHERE user_id = ?';
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

    if (studentRows[0]?.email) {
      try {
        await sendCertificateIssuedEmail({
          to: studentRows[0].email,
          studentName: studentRows[0].full_name,
          studentId: student_id,
          certificateId: certificate_id,
          courseName: course_name,
          instituteName: issuerName,
          issuedDate: issued_date
        });
      } catch (emailErr) {
        console.error('Certificate email error:', emailErr.message);
      }
    }

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
    const [studentRows] = await db.execute('SELECT full_name, email FROM students WHERE user_id = ?', [student_id]);
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
    const [studentRows] = await db.execute('SELECT full_name, email FROM students WHERE user_id = ?', [student_id]);
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

    if (studentRows[0]?.email) {
      try {
        await sendCertificateIssuedEmail({
          to: studentRows[0].email,
          studentName: studentRows[0].full_name,
          studentId: student_id,
          certificateId: certificate_id,
          courseName: course_name,
          instituteName: instRows[0].institute_name || 'Unknown',
          issuedDate: issued_date
        });
      } catch (emailErr) {
        console.error('Certificate email error:', emailErr.message);
      }
    }

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
        certId,
        certificate_id,
        studentName,
        student_name,
        courseName,
        course_name,
        grade,
        issueDate,
        issued_date,
        issuerName
      } = cert;

      // Normalize field names to handle both camelCase and snake_case
      const certId_normalized = certId || certificate_id;
      let studentName_normalized = studentName || student_name;
      const courseName_normalized = courseName || course_name;
      const issueDate_normalized = issueDate || issued_date;
      const issuerName_normalized = issuerName || instRows[0].institute_name || 'Unknown';
      const student_id_from_cert = cert.student_id;

      // Validate required fields
      if (!certId_normalized || !courseName_normalized || !issueDate_normalized) {
        results.push({
          certificate_id: certId_normalized,
          student_id: student_id_from_cert,
          success: false,
          error: 'Missing required fields (certId/certificate_id, courseName/course_name, issueDate/issued_date)'
        });
        continue;
      }

      try {
        console.log(`\n📋 Processing certificate ${i + 1}/${certificates.length}: ${certId_normalized}`);

        // Initialize student_id from cert if provided
        let student_id = student_id_from_cert;
        let gradeValue = grade;

        // Get student name if not provided
        if (!studentName_normalized && student_id) {
          console.log(`   🔍 Fetching student name for ${student_id}...`);
          const [sRows] = await db.execute('SELECT full_name, email FROM students WHERE user_id = ?', [student_id]);
          if (sRows.length > 0) {
            studentName_normalized = sRows[0].full_name;
            console.log(`   ✓ Found: ${studentName_normalized}`);
          }
        }

        if (!studentName_normalized) {
          studentName_normalized = `Student_${student_id || 'Unknown'}`;
        }

        const certData = {
          certId: certId_normalized,
          studentName: studentName_normalized,
          courseName: courseName_normalized,
          issueDate: issueDate_normalized,
          issuerName: issuerName_normalized
        };

        console.log(`   📦 Certificate data prepared:`, JSON.stringify(certData));

        // Step 1: Submit to blockchain via bulk auth
        console.log(`   🔗 Submitting to blockchain...`);
        const txResult = await blockchain.issueWithBulkAuth(
          certData,
          auth_hash,
          auth_signature,
          signer_address,
          batchIdNum,
          certCountNum,
          expiryNum
        );

        if (!txResult || !txResult.txHash) {
          throw new Error('Blockchain submission failed: No transaction hash returned');
        }

        console.log(`   ✅ Blockchain submission successful!`);
        console.log(`   TX Hash: ${txResult.txHash}`);
        console.log(`   Block: ${txResult.blockNumber}`);
        console.log(`   Gas Used: ${txResult.gasUsed}`);

        // Step 2: Determine blockchain status based on receipt
        const blockchainStatus = txResult.status === 1 ? 'confirmed' : 'submitted';
        const blockchainTimestamp = new Date();

        // Step 3: Fetch existing certificate to get student_id
        console.log(`   🔍 Fetching existing certificate from DB...`);
        const [existingCerts] = await db.execute(
          'SELECT user_id, grade FROM certificates WHERE certificate_id = ?',
          [certId_normalized]
        );

        if (existingCerts.length > 0) {
          console.log(`   ✓ Found existing certificate`);
          student_id = existingCerts[0].user_id;
          gradeValue = gradeValue || existingCerts[0].grade;
          console.log(`   ✓ Student ID: ${student_id}, Grade: ${gradeValue}`);
        } else {
          console.log(`   ⚠️  No existing certificate found, will create new record`);
          if (!student_id) {
            throw new Error('student_id is required for new certificates');
          }
        }

        // Step 4: Store/Update in database with blockchain data
        const insertQuery = `
          INSERT INTO certificates 
          (certificate_id, user_id, institute_id, certificate_title, course, issued_date, grade, blockchain_tx_hash, blockchain_status, blockchain_timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            blockchain_tx_hash = VALUES(blockchain_tx_hash),
            blockchain_status = VALUES(blockchain_status),
            blockchain_timestamp = VALUES(blockchain_timestamp)
        `;

        console.log(`   💾 Storing in database...`);
        await db.execute(insertQuery, [
          certId_normalized ?? null,
          student_id ?? null,
          req.user.institute_id ?? null,
          courseName_normalized ?? null,
          courseName_normalized ?? null,
          issueDate_normalized ?? null,
          gradeValue ?? null,
          txResult.txHash,
          blockchainStatus,
          blockchainTimestamp
        ]);

        if (student_id) {
          try {
            const [emailRows] = await db.execute('SELECT email, full_name FROM students WHERE user_id = ?', [student_id]);
            if (emailRows.length > 0 && emailRows[0].email) {
              await sendCertificateIssuedEmail({
                to: emailRows[0].email,
                studentName: emailRows[0].full_name,
                studentId: student_id,
                certificateId: certId_normalized,
                courseName: courseName_normalized,
                instituteName: issuerName_normalized,
                issuedDate: issueDate_normalized
              });
            }
          } catch (emailErr) {
            console.error('Certificate email error:', emailErr.message);
          }
        }

        console.log(`   ✓ Database updated successfully`);

        // Step 5: Add to results
        results.push({
          certificate_id: certId_normalized,
          student_id: student_id,
          blockchain_tx_hash: txResult.txHash,
          blockchain_status: blockchainStatus,
          blockchain_block: txResult.blockNumber,
          blockchain_gas_used: txResult.gasUsed,
          success: true
        });

      } catch (err) {
        console.error(`   ❌ Error processing certificate ${certId_normalized}:`, err.message);
        console.error(`   Stack:`, err.stack);

        // Try to get student_id from error context or existing certificate
        let errorStudentId = student_id_from_cert;
        try {
          const [existingCerts] = await db.execute(
            'SELECT user_id FROM certificates WHERE certificate_id = ?',
            [certId_normalized || certId || certificate_id]
          );
          if (existingCerts.length > 0) {
            errorStudentId = existingCerts[0].user_id;
          }
        } catch (lookupErr) {
          // Ignore lookup errors in error handler
        }

        results.push({
          certificate_id: certId || certificate_id,
          student_id: errorStudentId,
          success: false,
          error: err.message,
          blockchain_status: 'failed'
        });
      }
    }

    console.log('\n========== BULK ISSUE COMPLETE ==========');
    console.log(`✅ Processed ${certificates.length} certificates`);
    console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);

    // Return response with transaction hashes
    res.json({
      success: true,
      total: certificates.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
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
        const studentQuery = 'SELECT full_name, email FROM students WHERE user_id = ?';
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

        try {
          const [emailRows] = await db.execute('SELECT email, full_name FROM students WHERE user_id = ?', [student_id]);
          if (emailRows.length > 0 && emailRows[0].email) {
            const [instRows] = await db.execute('SELECT institute_name FROM institutes WHERE institute_id = ?', [req.user.institute_id]);
            const instituteName = instRows[0]?.institute_name || 'Unknown';
            await sendCertificateIssuedEmail({
              to: emailRows[0].email,
              studentName: emailRows[0].full_name,
              studentId: student_id,
              certificateId: certificate_id,
              courseName: course_name,
              instituteName,
              issuedDate: issued_date
            });
          }
        } catch (emailErr) {
          console.error('Certificate email error:', emailErr.message);
        }

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

// Verify institute email
exports.verifyInstituteEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Missing verification token.'
      }));
    }

    const tokenHash = hashToken(token);
    const institute = await Institute.findByVerificationToken(tokenHash);

    if (!institute) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Invalid or expired verification link.'
      }));
    }

    if (institute.email_verified) {
      return res.send(renderVerificationPage({
        success: true,
        message: 'Email already verified.'
      }));
    }

    if (institute.email_verification_expires && new Date(institute.email_verification_expires) < new Date()) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Verification link expired. Please request a new link.'
      }));
    }

    await Institute.markEmailVerified(institute.institute_id);

    return res.send(renderVerificationPage({
      success: true,
      message: 'Email verified successfully. You can log in now.'
    }));
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).send(renderVerificationPage({
      success: false,
      message: 'Server error while verifying email.'
    }));
  }
};

// Resend institute verification email
exports.resendInstituteVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const institute = await Institute.findByEmail(email);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    if (institute.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const { token, tokenHash, expiresAt } = createVerificationToken();
    await Institute.setEmailVerification(institute.institute_id, tokenHash, expiresAt);
    await sendInstituteVerificationEmail({ name: institute.institute_name, email: institute.email, token });

    return res.json({
      success: true,
      message: 'Verification email sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Server error while sending verification email' });
  }
};
