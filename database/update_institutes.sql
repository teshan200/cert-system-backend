-- Update institutes table to add email and password_hash columns
-- Run this in phpMyAdmin SQL tab

USE cert_verification_system;

-- Add email column if it doesn't exist
ALTER TABLE institutes 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NOT NULL AFTER institute_name;

-- Add password_hash column if it doesn't exist
ALTER TABLE institutes 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL AFTER email;

-- Add updated_at column if it doesn't exist
ALTER TABLE institutes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Remove old columns that are not needed
ALTER TABLE institutes 
DROP COLUMN IF EXISTS institute_address,
DROP COLUMN IF EXISTS institute_logo,
DROP COLUMN IF EXISTS verification_document,
DROP COLUMN IF EXISTS approved_at,
DROP COLUMN IF EXISTS approved_by;

-- Verify the structure
DESCRIBE institutes;
