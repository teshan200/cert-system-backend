const db = require('../config/database');
const blockchain = require('../utils/blockchain');

// Public: verify by certificate ID
exports.verifyByCertificateId = async (req, res) => {
  try {
    const { certificateId } = req.params;
    if (!certificateId) return res.status(400).json({ success: false, error: 'certificateId is required' });

    const query = `
      SELECT 
        c.*, 
        i.institute_name,
        i.wallet_address as issuer_wallet,
        i.logo_url,
        s.full_name as student_name,
        s.email as student_email
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      JOIN students s ON c.user_id = s.user_id
      WHERE c.certificate_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [certificateId]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Certificate not found' });

    const cert = rows[0];
    let onchain = { checked: false };

    try {
      const chain = await blockchain.verifyCertificate(certificateId);
      onchain = { checked: true, ...chain };

      if (chain && chain.verified && typeof blockchain.compareData === 'function') {
        const comparison = blockchain.compareData(cert, chain.data);
        onchain.comparison = comparison;
      }
    } catch (err) {
      onchain = { checked: true, verified: false, error: err.message };
    }

    res.json({ success: true, certificate: cert, onchain });
  } catch (error) {
    console.error('verifyByCertificateId error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Public: list certificates by user ID
exports.listByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });

    const studentQuery = 'SELECT user_id, full_name, email, gender, birthdate FROM students WHERE user_id = ? LIMIT 1';
    const [stuRows] = await db.execute(studentQuery, [userId]);
    if (!stuRows.length) return res.status(404).json({ success: false, error: 'Student not found' });

    const certQuery = `
      SELECT 
        c.*, 
        i.institute_name,
        i.wallet_address as issuer_wallet,
        i.logo_url
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      WHERE c.user_id = ?
      ORDER BY c.issued_date DESC
    `;

    const [certRows] = await db.execute(certQuery, [userId]);

    res.json({ success: true, student: stuRows[0], certificates: certRows });
  } catch (error) {
    console.error('listByUserId error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
