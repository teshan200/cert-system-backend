// Student Model - Database operations
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Student = {
  // Create new student
  async create(studentData) {
    const userId = `STU${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const query = `
      INSERT INTO students (user_id, full_name, email, password_hash, gender, birthdate)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      userId,
      studentData.full_name,
      studentData.email,
      studentData.password_hash,
      studentData.gender,
      studentData.birthdate
    ]);

    return { userId, ...studentData };
  },

  // Find student by email
  async findByEmail(email) {
    const query = 'SELECT * FROM students WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  // Find student by user ID
  async findById(userId) {
    const query = 'SELECT user_id, full_name, email, gender, birthdate, is_portfolio_public, profile_photo_url, cv_url, github_url, email_verified, created_at FROM students WHERE user_id = ?';
    const [rows] = await db.execute(query, [userId]);
    return rows[0];
  },

  // Get student certificates
  async getCertificates(userId) {
    const query = `
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

    const [rows] = await db.execute(query, [userId]);
    return rows;
  },

  // Check if email exists
  async emailExists(email) {
    const query = 'SELECT COUNT(*) as count FROM students WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0].count > 0;
  },

  // Set email verification token
  async setEmailVerification(userId, tokenHash, expiresAt) {
    const query = `
      UPDATE students
      SET email_verification_token = ?, email_verification_expires = ?, email_verified = 0
      WHERE user_id = ?
    `;
    await db.execute(query, [tokenHash, expiresAt, userId]);
  },

  // Find by verification token
  async findByVerificationToken(tokenHash) {
    const query = `
      SELECT user_id, email, full_name, email_verified, email_verification_expires
      FROM students
      WHERE email_verification_token = ?
    `;
    const [rows] = await db.execute(query, [tokenHash]);
    return rows[0];
  },

  // Mark email as verified
  async markEmailVerified(userId) {
    const query = `
      UPDATE students
      SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL
      WHERE user_id = ?
    `;
    await db.execute(query, [userId]);
  }
};

module.exports = Student;
