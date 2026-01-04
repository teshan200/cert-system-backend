// Institute Model - Database operations for universities
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Institute {
  // Create new institute
  static async create(name, walletAddress, email, password_hash) {
    try {
      const institute_id = 'INST' + Date.now() + uuidv4().substring(0, 8);
      
      const query = `
        INSERT INTO institutes (institute_id, institute_name, wallet_address, email, password_hash, verification_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await db.execute(query, [
        institute_id,
        name,
        walletAddress,
        email,
        password_hash,
        'pending'
      ]);

      return { institute_id, name, walletAddress, email };
    } catch (error) {
      throw new Error(`Failed to create institute: ${error.message}`);
    }
  }

  // Find by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM institutes WHERE email = ?';
      const [rows] = await db.execute(query, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find institute: ${error.message}`);
    }
  }

  // Find by institute ID
  static async findById(institute_id) {
    try {
      const query = 'SELECT * FROM institutes WHERE institute_id = ?';
      const [rows] = await db.execute(query, [institute_id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find institute: ${error.message}`);
    }
  }

  // Find by wallet address
  static async findByWallet(walletAddress) {
    try {
      const query = 'SELECT * FROM institutes WHERE wallet_address = ?';
      const [rows] = await db.execute(query, [walletAddress]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find institute by wallet: ${error.message}`);
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const query = 'SELECT COUNT(*) as count FROM institutes WHERE email = ?';
      const [rows] = await db.execute(query, [email]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Failed to check email: ${error.message}`);
    }
  }

  // Check if wallet exists
  static async walletExists(walletAddress) {
    try {
      const query = 'SELECT COUNT(*) as count FROM institutes WHERE wallet_address = ?';
      const [rows] = await db.execute(query, [walletAddress]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Failed to check wallet: ${error.message}`);
    }
  }

  // Get all pending institutes (for admin approval)
  static async getPending() {
    try {
      const query = 'SELECT institute_id, institute_name, email, wallet_address, created_at FROM institutes WHERE verification_status = ? ORDER BY created_at DESC';
      const [rows] = await db.execute(query, ['pending']);
      return rows;
    } catch (error) {
      throw new Error(`Failed to get pending institutes: ${error.message}`);
    }
  }

  // Get approved institutes
  static async getApproved() {
    try {
      const query = 'SELECT * FROM institutes WHERE verification_status = ? ORDER BY institute_name';
      const [rows] = await db.execute(query, ['approved']);
      return rows;
    } catch (error) {
      throw new Error(`Failed to get approved institutes: ${error.message}`);
    }
  }

  // Update verification status
  static async updateStatus(institute_id, status) {
    try {
      const query = 'UPDATE institutes SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE institute_id = ?';
      await db.execute(query, [status, institute_id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to update institute status: ${error.message}`);
    }
  }

  // Get institute dashboard info
  static async getDashboard(institute_id) {
    try {
      const institute = await this.findById(institute_id);
      if (!institute) throw new Error('Institute not found');

      // Get total certificates issued
      const certQuery = 'SELECT COUNT(*) as total FROM certificates WHERE institute_id = ?';
      const [certRows] = await db.execute(certQuery, [institute_id]);

      // Get recent certificates
      const recentQuery = `
        SELECT c.certificate_id, c.user_id, c.course, c.issued_date, c.grade
        FROM certificates c
        WHERE c.institute_id = ?
        ORDER BY c.issued_date DESC
        LIMIT 5
      `;
      const [recentRows] = await db.execute(recentQuery, [institute_id]);

      return {
        institute,
        totalCertificates: certRows[0].total,
        recentCertificates: recentRows
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard: ${error.message}`);
    }
  }

  // Get institute's issued certificates
  static async getCertificates(institute_id) {
    try {
      const query = `
        SELECT c.*, s.full_name as issuer_name
        FROM certificates c
        LEFT JOIN students s ON c.user_id = s.user_id
        WHERE c.institute_id = ?
        ORDER BY c.issued_date DESC
      `;
      const [rows] = await db.execute(query, [institute_id]);
      return rows;
    } catch (error) {
      throw new Error(`Failed to get certificates: ${error.message}`);
    }
  }
}

module.exports = Institute;
