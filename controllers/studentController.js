// Student Controller - Dashboard and certificate operations
const Student = require('../models/Student');

// Get student dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get student info
    const student = await Student.findById(userId);
    
    // Get certificates
    const certificates = await Student.getCertificates(userId);

    res.json({
      success: true,
      student: {
        userId: student.user_id,
        full_name: student.full_name,
        email: student.email,
        gender: student.gender,
        birthdate: student.birthdate
      },
      certificates: certificates,
      totalCertificates: certificates.length
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all student certificates
exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user.userId;
    const certificates = await Student.getCertificates(userId);

    res.json({
      success: true,
      certificates
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single certificate details
exports.getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.userId;

    const query = `
      SELECT 
        c.*,
        i.institute_name,
        i.wallet_address as issuer_wallet
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      WHERE c.certificate_id = ? AND c.user_id = ?
    `;

    const db = require('../config/database');
    const [rows] = await db.execute(query, [certificateId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({
      success: true,
      certificate: rows[0]
    });

  } catch (error) {
    console.error('Get certificate details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify certificate on blockchain
exports.verifyCertificateOnBlockchain = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.userId;
    const blockchain = require('../utils/blockchain');
    const db = require('../config/database');

    // Get certificate from database
    const query = `
      SELECT c.*, i.institute_name
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      WHERE c.certificate_id = ? AND c.user_id = ?
    `;

    const [rows] = await db.execute(query, [certificateId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const dbCert = rows[0];

    // Verify on blockchain
    const blockchainResult = await blockchain.verifyCertificate(certificateId);

    if (!blockchainResult.verified) {
      return res.json({
        verified: false,
        onBlockchain: false,
        message: 'Certificate not found on blockchain'
      });
    }

    // Compare data
    const comparison = blockchain.compareData(dbCert, blockchainResult.data);

    res.json({
      verified: true,
      onBlockchain: true,
      databaseCert: {
        certificateId: dbCert.certificate_id,
        courseName: dbCert.course,
        grade: dbCert.grade,
        issueDate: dbCert.issued_date,
        issuerName: dbCert.institute_name,
        transactionHash: dbCert.blockchain_tx_hash
      },
      blockchainCert: blockchainResult.data,
      comparison: comparison,
      message: comparison.match ? '✅ Certificate verified on blockchain!' : '⚠️ Data mismatch'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
};
