# Blockchain Certificate Verification System - Backend

Version: 2.1  
Last Updated: February 13, 2026  
Base URL: `http://localhost:3001`

## Overview
This backend provides:
- JWT-based auth for students, universities, and admins
- Certificate issuance and verification on Polygon Amoy
- Public certificate/portfolio verification endpoints
- AI career insights for students (Gemini)
- Email verification flows
- Contact form API with rate limiting and email delivery

## Tech Stack
- Node.js + Express
- MySQL
- ethers.js (Polygon Amoy)
- JWT + bcrypt
- Multer (file uploads)
- Nodemailer (SMTP)
- Google Generative AI SDK

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure `.env` values (database, JWT, blockchain, SMTP, Gemini).

4. Create database and import schema:
```bash
mysql -u root -p
CREATE DATABASE cert_verification_system;
```
```bash
mysql -u root -p cert_verification_system < database/schema.sql
```

5. Seed admin:
```bash
node seedAdmin.js
```

6. Run server:
```bash
npm run dev
```

## Environment Variables
See `.env.example` for full list. Core keys:

```dotenv
# Blockchain
RPC_URL=https://rpc-amoy.polygon.technology
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password_here
DB_NAME=cert_verification_system

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
SMTP_FROM=CertiChain <no-reply@example.com>

# Contact/email branding
ADMIN_EMAIL=test@kavindu.click
SUPPORT_EMAIL=support@yourdomain.com
EMAIL_LOGO_URL=https://your-domain.com/path-to-logo.png
APP_NAME=CertiChain

# URLs
APP_URL=http://localhost:3001
FRONTEND_URL=https://your-frontend-domain.com

# Email verification
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_TTL_HOURS=24
```

## Authentication
Protected routes require:
```http
Authorization: Bearer <JWT_TOKEN>
```

## Static File Access
- Public: `/uploads/institutes/logos/*`
- Public: `/uploads/students/*`
- Protected: `/uploads/institutes/documents/*` (requires JWT)
- Protected helper endpoint: `GET /api/files/:filename`

## Health Endpoints
- `GET /api/health`
- `GET /api/contact/health`

## API Routes

### Auth (`/api/auth`)
- `POST /student/register`
- `POST /student/login`
- `GET /student/verify-email`
- `POST /student/resend-verification`
- `GET /student/profile` (student auth)

### Student (`/api/student`)
- `GET /dashboard`
- `GET /certificates`
- `GET /certificates/:certificateId`
- `GET /certificates/:certificateId/verify`
- `POST /career-insights`
- `PATCH /portfolio/visibility`
- `PATCH /profile` (multipart: `profile_photo`, `cv`)

### University (`/api/university`)
Public:
- `POST /register` (multipart: `logo`, `verification_doc`)
- `POST /login`
- `GET /verify-email`
- `POST /resend-verification`

Protected (university auth):
- `GET /profile`
- `GET /dashboard`
- `GET /students/search?query=...&limit=...`
- `POST /certificate/issue`
- `POST /certificate/sign-payload`
- `POST /certificate/issue-signed`
- `POST /certificate/bulk-auth`
- `POST /certificate/bulk-issue-signed`
- `GET /certificates`
- `POST /certificates/bulk`

### Admin (`/api/admin`)
Public:
- `POST /login`

Protected (admin auth):
- `GET /profile`
- `GET /dashboard`
- `GET /institutes`
- `GET /institutes/pending`
- `GET /institutes/:institute_id/issuer-status`
- `POST /institutes/:institute_id/approve`
- `POST /institutes/:institute_id/reject`
- `POST /institutes/:institute_id/revoke`
- `GET /statistics`
- `GET /blockchain/status`

### Verify (`/api/verify`)
Public:
- `GET /certificate/:certificateId`
- `GET /user/:userId`

### Payment (`/api/payment`)
- `GET /gas-cost`
- `GET /balance?address=0x...`
- `POST /issue-with-metamask`
- `POST /bulk-issue`

### MetaMask (`/api/metamask`)
- `POST /issue-with-metamask`
- `GET /status`

### Contact (`/api/contact`) - New
Public:
- `POST /send-message`
- `GET /health`

`POST /send-message` body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Need help with verification",
  "message": "I need help verifying my certificate..."
}
```

Validation limits:
- Name: 2-100 chars
- Email: valid format, max 255 chars
- Subject: 3-200 chars
- Message: 10-5000 chars

Rate limit:
- 5 requests per hour per client IP
- Returns `429` when exceeded

Production origin check:
- `http://localhost:5173` and `http://localhost:3000` are allowed directly in `server.js` for local development
- In production, `FRONTEND_URL` is used as the main frontend origin

## Project Structure
```text
config/
controllers/
  authController.js
  studentController.js
  universityController.js
  adminController.js
  verifyController.js
  contactController.js
routes/
  auth.js
  student.js
  university.js
  admin.js
  verify.js
  payment.js
  metamask-routes.js
  contact.js
utils/
  blockchain.js
  mailer.js
  emailVerification.js
  contactEmail.js
database/
  schema.sql
server.js
```

## Notes
- Contract details and signing flow are documented in `contracts/README.md`.
- Contact API depends on SMTP configuration; missing SMTP vars will cause email send failures.
