// Admin Model - Database operations for admins
const db = require('../config/database');

class Admin {
  // Find admin by username
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM admins WHERE username = ?';
      const [rows] = await db.execute(query, [username]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find admin: ${error.message}`);
    }
  }

  // Find admin by ID
  static async findById(admin_id) {
    try {
      const query = 'SELECT * FROM admins WHERE admin_id = ?';
      const [rows] = await db.execute(query, [admin_id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find admin: ${error.message}`);
    }
  }

  // Get pending universities
  static async getPendingInstitutes() {
    try {
      const query = `
        SELECT institute_id, institute_name, email, wallet_address, created_at
        FROM institutes 
        WHERE verification_status = 'pending'
        ORDER BY created_at DESC
      `;
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Failed to get pending institutes: ${error.message}`);
    }
  }

  // Get all institutes
  static async getAllInstitutes() {
    try {
      const query = `
        SELECT institute_id, institute_name, email, wallet_address, verification_status, created_at
        FROM institutes
        ORDER BY created_at DESC
      `;
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Failed to get institutes: ${error.message}`);
    }
  }

  // Get institute basic info by id
  static async getInstituteById(institute_id) {
    try {
      const query = `
        SELECT institute_id, institute_name, wallet_address, email, verification_status
        FROM institutes
        WHERE institute_id = ?
      `;
      const [rows] = await db.execute(query, [institute_id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to get institute: ${error.message}`);
    }
  }

  // Approve institute
  static async approveInstitute(institute_id) {
    try {
      const query = 'UPDATE institutes SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE institute_id = ?';
      await db.execute(query, ['approved', institute_id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to approve institute: ${error.message}`);
    }
  }

  // Reject institute
  static async rejectInstitute(institute_id) {
    try {
      const query = 'UPDATE institutes SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE institute_id = ?';
      await db.execute(query, ['rejected', institute_id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to reject institute: ${error.message}`);
    }
  }

  // Get system statistics
  static async getStatistics() {
    try {
      const studentQuery = 'SELECT COUNT(*) as total FROM students';
      const instituteQuery = 'SELECT COUNT(*) as total FROM institutes';
      const instituteApprovedQuery = 'SELECT COUNT(*) as total FROM institutes WHERE verification_status = "approved"';
      const institutePendingQuery = 'SELECT COUNT(*) as total FROM institutes WHERE verification_status = "pending"';
      const certificateQuery = 'SELECT COUNT(*) as total FROM certificates';

      const [studentRows] = await db.execute(studentQuery);
      const [instituteRows] = await db.execute(instituteQuery);
      const [approvedRows] = await db.execute(instituteApprovedQuery);
      const [pendingRows] = await db.execute(institutePendingQuery);
      const [certRows] = await db.execute(certificateQuery);

      return {
        totalStudents: studentRows[0].total,
        totalInstitutes: instituteRows[0].total,
        approvedInstitutes: approvedRows[0].total,
        pendingInstitutes: pendingRows[0].total,
        totalCertificates: certRows[0].total
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

module.exports = Admin;
