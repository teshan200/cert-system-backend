-- Certificate Verification System Database Schema
-- MySQL Database for XAMPP

CREATE DATABASE IF NOT EXISTS cert_verification_system;
USE cert_verification_system;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    birthdate DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Universities/Institutes Table
CREATE TABLE IF NOT EXISTS institutes (
    institute_id VARCHAR(50) PRIMARY KEY,
    institute_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Certificates Table (Local copy of blockchain data)
CREATE TABLE IF NOT EXISTS certificates (
    certificate_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    institute_id VARCHAR(50) NOT NULL,
    certificate_title VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE NULL,
    grade VARCHAR(50) NULL,
    blockchain_tx_hash VARCHAR(66),
    blockchain_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_institute_id (institute_id),
    INDEX idx_certificate_id (certificate_id)
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
    admin_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career Path Analysis (AI Generated)
CREATE TABLE IF NOT EXISTS career_paths (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    career_suggestions TEXT,
    skills_identified TEXT,
    recommended_courses TEXT,
    summary TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Insert default admin (password: admin123 - CHANGE THIS!)
INSERT INTO admins (admin_id, username, password_hash, email) 
VALUES ('ADMIN001', 'admin', '$2b$10$XQqhH9vGvKJKZQ8ZqF6X6.xN8fYVJW8YjYKZxZQXqZqZqZqZqZqZq', 'admin@certplatform.com')
ON DUPLICATE KEY UPDATE admin_id = admin_id;

-- Create indexes for better performance
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_institute_wallet ON institutes(wallet_address);
CREATE INDEX idx_certificate_blockchain ON certificates(blockchain_tx_hash);

-- Option 3 On-chain Payment Ledger Tables
CREATE TABLE IF NOT EXISTS university_gas_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_wallet VARCHAR(42) NOT NULL UNIQUE,
    balance_deposited DECIMAL(30, 8) DEFAULT 0,
    balance_spent DECIMAL(30, 8) DEFAULT 0,
    balance_remaining DECIMAL(30, 8) DEFAULT 0,
    last_deposit_tx VARCHAR(255) NULL,
    last_withdrawal_tx VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gas_balance_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_wallet VARCHAR(42) NOT NULL,
    change_type ENUM('deposit', 'debit', 'withdraw') NOT NULL,
    amount_pol DECIMAL(30, 8) NOT NULL,
    tx_hash VARCHAR(255) NULL,
    reference VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_type (university_wallet, change_type)
);

CREATE TABLE IF NOT EXISTS certificate_gas_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cert_id VARCHAR(100) NOT NULL UNIQUE,
    university_wallet VARCHAR(42) NOT NULL,
    gas_cost_pol DECIMAL(30, 8) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL,
    status ENUM('pending', 'confirmed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_status (university_wallet, status)
);
