-- Seed default admin user for initial setup
-- Username: admin
-- Password: admin123 (hashed with bcrypt round 10)

USE cert_verification_system;

-- Insert default admin if not exists
INSERT IGNORE INTO admins (admin_id, username, password_hash, created_at)
VALUES ('ADMIN001', 'admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OzeIKZWGUfZ1d7ZxV8Fh1WDq0f5bZH.YAG', CURRENT_TIMESTAMP);

-- Verify the insert
SELECT * FROM admins WHERE username = 'admin';
