// Generate bcrypt hash for admin password and insert into database
const bcrypt = require('bcrypt');
const db = require('./config/database');
require('dotenv').config();

async function seedAdmin() {
  try {
    console.log('🔐 Seeding default admin user...\n');

    const username = 'admin';
    const password = 'admin123';

    // Generate bcrypt hash
    const password_hash = await bcrypt.hash(password, 10);
    console.log('Generated password hash:', password_hash);

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM admins WHERE username = ?';
    const [existing] = await db.execute(checkQuery, [username]);

    if (existing.length > 0) {
      console.log('✓ Admin user already exists');
      console.log('  Username:', existing[0].username);
      return;
    }

    // Insert new admin
    const insertQuery = 'INSERT INTO admins (admin_id, username, password_hash) VALUES (?, ?, ?)';
    await db.execute(insertQuery, ['ADMIN001', username, password_hash]);

    console.log('✅ Admin user created successfully!\n');
    console.log('Credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
