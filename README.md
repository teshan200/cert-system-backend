# Blockchain Certificate Verification System - API Documentation

**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** February 5, 2026  
**Base URL:** `http://localhost:3001`

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication](#authentication)
4. [Student API](#student-api)
5. [University API](#university-api)
6. [Admin API](#admin-api)
7. [Public Verify API](#public-verify-api)
8. [Payment API](#payment-api) ⭐ BLOCKCHAIN
9. [MetaMask Integration API](#metamask-integration-api) ⭐ BLOCKCHAIN
10. [AI Career Insights](#ai-career-insights) ⭐ NEW
11. [Data Models](#data-models)
12. [Error Handling](#error-handling)
13. [Frontend Integration](#frontend-integration)

---

## 🚀 Quick Start

### Installation
```bash
npm install
npm start
```

### Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and configure:
# - Database credentials (MySQL)
# - Blockchain settings (Polygon Amoy)
# - JWT secrets
# - Gemini API key for AI features
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

### Test Endpoints
```bash
# Student Dashboard
curl -X GET http://localhost:3001/api/student/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Career Insights (AI)
curl -X POST http://localhost:3001/api/student/career-insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerate": false}'
```

---

## � Setup & Configuration

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- MetaMask browser extension (for blockchain features)
- Gemini API key (for AI career insights)

### Environment Configuration

The project includes a `.env.example` file with all required configuration variables:

```dotenv
# Blockchain Configuration
RPC_URL=https://rpc-amoy.polygon.technology
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password_here
DB_NAME=cert_verification_system

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here
```

### Database Setup

1. Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE cert_verification_system;
```

2. Import schema:
```bash
mysql -u root -p cert_verification_system < database/schema.sql
```

3. Seed admin user:
```bash
node seedAdmin.js
# Default credentials: admin / admin123
```

### Installation & Running

```bash
# Install dependencies
npm install

# Start server (development)
npm run dev

# Start server (production)
npm start
```

Server will run on `http://localhost:3001`

---

## �🔐 Authentication

### JWT Token
All protected endpoints require JWT in Authorization header:
```http
Authorization: Bearer <token>
```

**Token Details:**
- Expiry: 7 days
- Format: Standard JWT with userId and role

---

## 👨‍🎓 Student API

### 1. Register Student
**POST** `/api/auth/student/register`

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "Male",
  "birthdate": "2000-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2. Login
**POST** `/api/auth/student/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 3. Get Profile
**GET** `/api/auth/student/profile`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "student": {
    "user_id": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "birthdate": "2000-01-15"
  }
}
```

---

### 4. Get Dashboard (Enhanced) ⭐ NEW
**GET** `/api/student/dashboard`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "certificates": [{...}],
  "statistics": {
    "totalCertificates": 3,
    "blockchainVerifiedCount": 2,
    "institutionsCount": 2,
    "activeCertificatesCount": 2
  },
  "institutions": [
    {
      "institute_id": "UNI456",
      "institute_name": "Tech University",
      "logo_url": "/uploads/...",
      "certificateCount": 2
    }
  ]
}
```

---

### 5. Get All Certificates
**GET** `/api/student/certificates`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "certificates": [
    {
      "certificate_id": "CERT123",
      "certificate_title": "Blockchain Cert",
      "course": "Blockchain Fundamentals",
      "institute_name": "Tech University",
      "issued_date": "2026-01-01",
      "grade": "A",
      "blockchain_tx_hash": "0x123..."
    }
  ]
}
```

---

### 6. Get Certificate Details
**GET** `/api/student/certificates/:certificateId`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "certificate": {
    "certificate_id": "CERT123",
    "certificate_title": "Blockchain Certification",
    "course": "Blockchain Fundamentals",
    "issued_date": "2026-01-01",
    "grade": "A",
    "institute_name": "Tech University",
    "logo_url": "/uploads/...",
    "blockchain_tx_hash": "0x123..."
  }
}
```

---

### 7. Verify on Blockchain
**GET** `/api/student/certificates/:certificateId/verify`  
**Auth:** Required

**Response (200):**
```json
{
  "verified": true,
  "onBlockchain": true,
  "message": "✅ Certificate verified on blockchain!"
}
```

---

## 🎓 University API

### 1. Register University
**POST** `/api/university/register`  
**Content-Type:** `multipart/form-data`

**Fields:**
- `institute_name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, min 6 chars)
- `wallet_address`: String (required, 0x + 40 hex chars)
- `logo`: File (optional, image)
- `verification_doc`: File (required, PDF/document)

**Response (201):**
```json
{
  "success": true,
  "message": "Institute registered. Awaiting admin approval.",
  "token": "eyJhbGc...",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "email": "admin@techuni.edu"
  }
}
```

---

### 2. Login
**POST** `/api/university/login`

```json
{
  "email": "admin@techuni.edu",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University"
  }
}
```

---

### 3. Get Profile
**GET** `/api/university/profile`  
**Auth:** Required

**Response (200):**
```json
{
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "email": "admin@techuni.edu",
    "wallet_address": "0x742d...",
    "verification_status": "approved",
    "logo_url": "/uploads/...",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 4. Get Dashboard
**GET** `/api/university/dashboard`  
**Auth:** Required

**Response (200):**
```json
{
  "totalCertificatesIssued": 150,
  "recentCertificates": [
    {
      "certificate_id": "CERT123",
      "student_name": "John Doe",
      "course": "Blockchain Fundamentals",
      "issued_date": "2026-01-01",
      "grade": "A"
    }
  ]
}
```

---

### 5. Issue Certificate
**POST** `/api/university/certificate/issue`  
**Auth:** Required

```json
{
  "student_id": "STU123456789",
  "course_name": "Blockchain Fundamentals",
  "grade": "A"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "certificate": {
    "certificate_id": "CERT123",
    "student_id": "STU123456789",
    "course_name": "Blockchain Fundamentals",
    "blockchain_tx_hash": "0x123..."
  }
}
```

---

### 6. Bulk Issue Certificates
**POST** `/api/university/certificates/bulk`  
**Auth:** Required

```json
{
  "certificates": [
    {
      "student_id": "STU111",
      "course_name": "Course A",
      "grade": "A"
    },
    {
      "student_id": "STU222",
      "course_name": "Course B",
      "grade": "B"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "successCount": 2,
  "failureCount": 0,
  "results": [
    {
      "student_id": "STU111",
      "certificate_id": "CERT123",
      "success": true
    }
  ]
}
```

---

### 7. Get University Certificates
**GET** `/api/university/certificates`  
**Auth:** Required

**Response (200):**
```json
{
  "total": 150,
  "certificates": [{...}]
}
```

---

### 8. Get Certificate Signature Payload ⭐ Blockchain
**POST** `/api/university/certificate/sign-payload`  
**Auth:** Required

**Request:**
```json
{
  "student_id": "STU123456789",
  "course_name": "Blockchain Fundamentals",
  "grade": "A",
  "issued_date": "2026-01-01"
}
```

**Response (200):**
```json
{
  "success": true,
  "message_hash": "0x...",
  "cert_id": "CERT123",
  "message_to_sign": "Certificate data for signing"
}
```

---

### 9. Issue Certificate with Signature ⭐ Blockchain
**POST** `/api/university/certificate/issue-signed`  
**Auth:** Required

**Request:**
```json
{
  "certId": "CERT123",
  "studentName": "John Doe",
  "courseName": "Blockchain Fundamentals",
  "issueDate": "2026-01-01",
  "issuerName": "Tech University",
  "messageHash": "0x...",
  "signature": "0x...",
  "signerAddress": "0x742d..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued on blockchain with signature",
  "certificate": {
    "certificate_id": "CERT123",
    "blockchain_tx_hash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "50000"
  }
}
```

---

### 10. Get Bulk Authorization Message ⭐ Blockchain
**POST** `/api/university/certificate/bulk-auth`  
**Auth:** Required

**Request:**
```json
{
  "certificates": [
    {
      "student_id": "STU111",
      "course_name": "Course A",
      "grade": "A",
      "issued_date": "2026-01-01"
    },
    {
      "student_id": "STU222",
      "course_name": "Course B",
      "grade": "B",
      "issued_date": "2026-01-01"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message_hash": "0x...",
  "certCount": 2,
  "message_to_sign": "Bulk certificate authorization message"
}
```

---

### 11. Bulk Issue with Single Signature ⭐ Blockchain
**POST** `/api/university/certificate/bulk-issue-signed`  
**Auth:** Required

**Request:**
```json
{
  "messageHash": "0x...",
  "signature": "0x...",
  "signerAddress": "0x742d...",
  "certificates": [
    {
      "certId": "CERT123",
      "studentName": "John Doe",
      "courseName": "Course A",
      "issueDate": "2026-01-01",
      "issuerName": "Tech University"
    },
    {
      "certId": "CERT124",
      "studentName": "Jane Smith",
      "courseName": "Course B",
      "issueDate": "2026-01-01",
      "issuerName": "Tech University"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "successCount": 2,
  "failureCount": 0,
  "message": "Bulk certificates issued on blockchain",
  "results": [
    {
      "certId": "CERT123",
      "txHash": "0x...",
      "success": true
    },
    {
      "certId": "CERT124",
      "txHash": "0x...",
      "success": true
    }
  ]
}
```

---

## 🔐 Admin API

### 1. Login
**POST** `/api/admin/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "admin_id": "ADMIN001",
    "username": "admin"
  }
}
```

---

### 2. Get Profile
**GET** `/api/admin/profile`  
**Auth:** Required

---

### 3. Get Dashboard
**GET** `/api/admin/dashboard`  
**Auth:** Required

**Response (200):**
```json
{
  "statistics": {
    "totalStudents": 500,
    "totalInstitutes": 25,
    "totalCertificates": 1200,
    "approvedInstitutes": 20,
    "pendingInstitutes": 3
  },
  "pendingInstitutes": [...]
}
```

---

### 4. Get All Institutes
**GET** `/api/admin/institutes`  
**Auth:** Required

---

### 5. Get Pending Institutes
**GET** `/api/admin/institutes/pending`  
**Auth:** Required

---

### 6. Approve Institute
**POST** `/api/admin/institutes/:institute_id/approve`  
**Auth:** Required

```json
{
  "notes": "Approved after verification"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Institute approved and authorized on blockchain",
  "blockchain": {
    "authorized": true,
    "tx_hash": "0x123..."
  }
}
```

---

### 7. Reject Institute
**POST** `/api/admin/institutes/:institute_id/reject`  
**Auth:** Required

```json
{
  "reason": "Invalid documents"
}
```

---

### 8. Get Statistics
**GET** `/api/admin/statistics`  
**Auth:** Required

---

## 💳 Payment API (Blockchain Gas Management) ⭐

### 1. Get Gas Cost
**GET** `/api/payment/gas-cost`  
**Auth:** Not required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "wei": "1500000000000000",
    "pol": "0.0015"
  }
}
```

---

### 2. Get University Balance
**GET** `/api/payment/balance?address=0x742d...`  
**Auth:** Not required  
**Query Parameters:**
- `address` (required): Wallet address (0x + 40 hex chars)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": "0x742d...",
    "balanceWei": "5000000000000000000",
    "balancePol": "5.0",
    "gasSpentWei": "0",
    "gasSpentPol": "0.0"
  }
}
```

---

### 3. Issue Certificate with MetaMask Payment
**POST** `/api/payment/issue-with-metamask`  
**Auth:** Not required

**Request:**
```json
{
  "certId": "CERT123",
  "studentName": "John Doe",
  "courseName": "Blockchain Fundamentals",
  "issueDate": "2026-01-01",
  "issuerName": "Tech University",
  "messageHash": "0x...",
  "signature": "0x...",
  "signerAddress": "0x742d..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued on-chain with prepaid gas",
  "data": {
    "certId": "CERT123",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "45000",
    "status": 1
  }
}
```

**Errors:**
- `400`: Missing required fields or message hash mismatch
- `500`: Blockchain transaction failed

---

### 4. Bulk Issue with Payment
**POST** `/api/payment/bulk-issue`  
**Auth:** Not required

**Request:**
```json
{
  "signerAddress": "0x742d...",
  "certificates": [
    {
      "certId": "CERT123",
      "studentName": "John Doe",
      "courseName": "Course A",
      "issueDate": "2026-01-01",
      "issuerName": "Tech University",
      "messageHash": "0x...",
      "signature": "0x..."
    },
    {
      "certId": "CERT124",
      "studentName": "Jane Smith",
      "courseName": "Course B",
      "issueDate": "2026-01-02",
      "issuerName": "Tech University",
      "messageHash": "0x...",
      "signature": "0x..."
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bulk issuance complete",
  "data": [
    {
      "certId": "CERT123",
      "txHash": "0x...",
      "blockNumber": 12345,
      "status": "success"
    },
    {
      "certId": "CERT124",
      "txHash": "0x...",
      "blockNumber": 12346,
      "status": "success"
    }
  ]
}
```

---

## 🔓 Public Verify API (No Auth Required)

### 1. Verify by Certificate ID
**GET** `/api/verify/certificate/:certificateId`

**Response (200):**
```json
{
  "success": true,
  "certificate": {
    "certificate_id": "CERT123",
    "student_name": "John Doe",
    "course": "Blockchain Fundamentals",
    "institute_name": "Tech University",
    "issued_date": "2026-01-01",
    "grade": "A"
  },
  "onchain": {
    "verified": true,
    "match": true
  }
}
```

---

### 2. Get Student Certificates
**GET** `/api/verify/user/:userId`

**Response (200):**
```json
{
  "success": true,
  "student": {
    "user_id": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "certificates": [...]
}
```

---

## � MetaMask Integration API ⭐ Blockchain

### 1. Issue Certificate with MetaMask
**POST** `/api/certificates/issue-with-metamask`  
**Auth:** Not required

**Request:**
```json
{
  "certId": "CERT123",
  "studentName": "John Doe",
  "courseName": "Blockchain Fundamentals",
  "issueDate": "2026-01-01",
  "issuerName": "Tech University",
  "messageHash": "0x...",
  "signature": "0x...",
  "signerAddress": "0x742d...",
  "universityId": "UNI456"
}
```

**Process:**
1. Frontend generates message hash from certificate data
2. User signs with MetaMask wallet
3. Backend verifies signature and submits to blockchain
4. Certificate is stored in database with transaction hash

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certId": "CERT123",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "45000",
    "status": 1
  }
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Signature verification failed (address mismatch)
- `500`: Blockchain transaction failed

---

### 2. Get MetaMask Status
**GET** `/api/metamask/status`  
**Auth:** Not required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "installed": true,
    "requiredChain": {
      "id": 80002,
      "name": "Polygon Amoy",
      "rpc": "https://rpc-amoy.polygon.technology"
    },
    "contract": {
      "address": "0x7d6159A7cBd7061AA231288651e750B5c5046343",
      "network": "Polygon Amoy"
    }
  }
}
```

**Usage:**
- Verify MetaMask is installed on client
- Confirm correct blockchain network (Polygon Amoy)
- Get contract address for verification

---

### MetaMask Integration Flow

```
1. User clicks "Issue with MetaMask"
2. Frontend prepares certificate data
3. Backend generates message hash via /api/university/certificate/sign-payload
4. Frontend requests MetaMask signature (user confirms)
5. Frontend sends signature to /api/certificates/issue-with-metamask
6. Backend verifies signature and submits to blockchain
7. Certificate tx hash stored in database
8. Frontend displays success with blockchain link
```

---

## �🤖 AI Career Insights ⭐ NEW

### Get Career Analysis
**POST** `/api/student/career-insights`  
**Auth:** Required  
**Requires:** GEMINI_API_KEY in .env

**Request:**
```json
{
  "regenerate": false
}
```

**Response (200):**
```json
{
  "success": true,
  "insights": {
    "careerMatches": [
      {
        "title": "Junior UI/UX Designer",
        "matchPercentage": 85
      },
      {
        "title": "Graphic Designer",
        "matchPercentage": 82
      }
    ],
    "topSkills": [
      "UI/UX Design Principles",
      "Adobe Illustrator (Advanced)",
      "Prototyping & Wireframing"
    ],
    "nextSteps": [
      {
        "step": "Step 1: Portfolio Construction",
        "title": "Build Comprehensive Portfolio",
        "description": "Develop 3-4 case studies showing your design thinking...",
        "completed": false
      },
      {
        "step": "Step 2: Master Industry Tools",
        "title": "Learn Figma",
        "description": "Complete advanced Figma courses...",
        "completed": false
      }
    ],
    "summary": "Based on your certificates in UI/UX Design, Digital Design, and Web Development, you demonstrate strong potential for design roles. With your technical background and design skills, you're well-prepared for entry-level positions at tech companies...",
    "generatedAt": "2026-02-05T10:30:00Z"
  }
}
```

**Features:**
- ✅ Uses Google Gemini 2.5 Flash AI
- ✅ Smart caching (returns cached unless regenerate=true)
- ✅ Analyzes certificates, courses, grades
- ✅ Generates realistic career matches (60-95%)
- ✅ Identifies relevant skills (5-7)
- ✅ Creates actionable next steps (4-5)
- ✅ Professional career summary

**Errors:**
- `400`: Student has no certificates
- `401`: Invalid token
- `404`: Student not found
- `500`: GEMINI_API_KEY not configured

---

## 📊 Data Models

### Student
```json
{
  "user_id": "STU123456789",
  "full_name": "String",
  "email": "String (unique)",
  "password_hash": "String (bcrypt)",
  "gender": "Male|Female|Other",
  "birthdate": "YYYY-MM-DD",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

### Institute
```json
{
  "institute_id": "UNI123456789",
  "institute_name": "String",
  "email": "String (unique)",
  "password_hash": "String (bcrypt)",
  "wallet_address": "0x... (42 chars, unique)",
  "verification_status": "pending|approved|rejected",
  "logo_url": "String or null",
  "verification_doc_url": "String or null",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

### Certificate
```json
{
  "certificate_id": "CERT123456789",
  "user_id": "STU123456789",
  "institute_id": "UNI123456789",
  "certificate_title": "String",
  "course": "String",
  "issued_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD or null",
  "grade": "String",
  "blockchain_tx_hash": "0x... or null",
  "blockchain_status": "pending|submitted|confirmed",
  "blockchain_timestamp": "Timestamp or null",
  "blockchain_verified": "Boolean",
  "created_at": "Timestamp"
}
```

### Career Path (AI-Generated)
```json
{
  "id": "Integer (auto-increment)",
  "user_id": "STU123456789",
  "career_suggestions": "Text (JSON array)",
  "skills_identified": "Text (JSON array)",
  "recommended_courses": "Text (JSON array)",
  "summary": "Text (career overview)",
  "generated_at": "Timestamp"
}
```

### Admin
```json
{
  "admin_id": "ADMIN001",
  "username": "String (unique)",
  "password_hash": "String (bcrypt)",
  "email": "String (unique)",
  "created_at": "Timestamp"
}
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (no token or wrong role)
- `404` - Not Found
- `409` - Conflict (duplicate email/wallet)
- `500` - Server Error

### Common Errors
| Error | Fix |
|-------|-----|
| `"No token provided"` | Add Authorization header with JWT |
| `"Invalid or expired token"` | Login again to get new token |
| `"All fields are required"` | Check all required fields in request |
| `"Invalid email format"` | Use valid email address |
| `"Email already registered"` | Use different email |
| `"Institute not approved"` | Wait for admin approval |
| `"Certificate not found"` | Check certificate ID |

---

## 🎨 Frontend Integration

### React Example - Login & Get Dashboard

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function loginStudent(email, password) {
  const response = await api.post('/auth/student/login', {
    email,
    password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
}

// Get Dashboard
async function getDashboard() {
  const response = await api.get('/student/dashboard');
  return response.data;
}

// Get Career Insights (AI)
async function getCareerInsights() {
  const response = await api.post('/student/career-insights', {
    regenerate: false
  });
  return response.data.insights;
}
```

### MetaMask Integration Example

```javascript
// Check MetaMask and get config
async function checkMetaMask() {
  const response = await fetch('http://localhost:3001/api/metamask/status');
  const { data } = await response.json();
  
  // Switch to Polygon Amoy if needed
  if (window.ethereum) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + data.requiredChain.id.toString(16) }]
    });
  }
}

// Issue certificate with MetaMask signature
async function issueWithMetaMask(certificateData, signerAddress) {
  // 1. Get message hash from backend
  const hashResponse = await fetch('http://localhost:3001/api/university/certificate/sign-payload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      student_id: certificateData.studentId,
      course_name: certificateData.courseName,
      grade: certificateData.grade,
      issued_date: certificateData.issueDate
    })
  });
  
  const { message_hash, cert_id } = await hashResponse.json();
  
  // 2. Request MetaMask signature
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message_hash, signerAddress]
  });
  
  // 3. Submit signed certificate
  const issueResponse = await fetch('http://localhost:3001/api/payment/issue-with-metamask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      certId: cert_id,
      studentName: certificateData.studentName,
      courseName: certificateData.courseName,
      issueDate: certificateData.issueDate,
      issuerName: certificateData.issuerName,
      messageHash: message_hash,
      signature: signature,
      signerAddress: signerAddress
    })
  });
  
  return await issueResponse.json();
}

// Get wallet balance
async function getWalletBalance(address) {
  const response = await fetch(`http://localhost:3001/api/payment/balance?address=${address}`);
  const { data } = await response.json();
  console.log(`Balance: ${data.balancePol} POL`);
  return data;
}
```

### JavaScript Fetch Example - Student Login

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/student/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// Get Dashboard
const dashResponse = await fetch('http://localhost:3001/api/student/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const dashboard = await dashResponse.json();
console.log(dashboard);

// Get Career Insights
const insightsResponse = await fetch('http://localhost:3001/api/student/career-insights', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ regenerate: false })
});

const { insights } = await insightsResponse.json();
console.log('Career Insights:', insights);
```

### Verify Certificate Example

```javascript
// Verify certificate publicly (no auth needed)
async function verifyCertificate(certificateId) {
  const response = await fetch(`http://localhost:3001/api/verify/certificate/${certificateId}`);
  const { certificate, onchain } = await response.json();
  
  console.log('Certificate:', certificate);
  console.log('Blockchain Verified:', onchain.verified);
  return { certificate, onchain };
}

// Get all certificates of a student (public)
async function getStudentCertificates(userId) {
  const response = await fetch(`http://localhost:3001/api/verify/user/${userId}`);
  const { student, certificates } = await response.json();
  
  console.log('Student:', student);
  console.log('Certificates:', certificates);
  return { student, certificates };
}
```

---

## 📁 Project Structure

```
cert-system/
├── config/              # Configuration
│   └── database.js      # MySQL database connection
├── controllers/         # Route controllers
│   ├── studentController.js      (Student endpoints + AI Career Insights)
│   ├── universityController.js   (University endpoints + Blockchain signing)
│   ├── adminController.js        (Admin endpoints)
│   ├── authController.js         (Authentication)
│   └── verifyController.js       (Public verification)
├── routes/             # Route definitions
│   ├── student.js               (Student endpoints)
│   ├── university.js            (University endpoints)
│   ├── admin.js                 (Admin endpoints)
│   ├── auth.js                  (Authentication)
│   ├── verify.js                (Public verify endpoints)
│   ├── payment.js               (Payment & Gas management)
│   └── metamask-routes.js       (MetaMask signature handling)
├── models/             # Data models
│   ├── Student.js
│   ├── Institute.js
│   ├── Admin.js
│   └── Certificate.js
├── middleware/         # Middleware
│   ├── auth.js         (JWT verification, role-based access)
│   └── upload.js       (File upload handling for logos/docs)
├── database/           # Database schemas & seeds
│   ├── schema.sql      (Main database schema)
│   ├── cert_verification_system.sql
│   ├── seed_admin.sql
│   └── update_institutes.sql
├── utils/              # Utilities
│   └── blockchain.js   (Ethereum/Polygon contract interaction)
├── public/             # Static files & file uploads
│   └── uploads/
│       ├── institutes/
│       │   ├── documents/   (University verification documents)
│       │   └── logos/       (University logos)
│       └── certificates/    (Certificate files)
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment template with all configuration options
├── .gitignore          # Git ignore patterns
├── package.json        # Dependencies & scripts
├── server.js           # Main Express server
├── seedAdmin.js        # Admin user seeding script
└── README.md           # This file
```

---

## 🔗 Blockchain Configuration

### Supported Networks
- **Polygon Amoy** (Testnet - Current)
  - Chain ID: 80002
  - RPC: https://rpc-amoy.polygon.technology
  - Contract: 0x7d6159A7cBd7061AA231288651e750B5c5046343

### Environment Variables for Blockchain
```dotenv
# Blockchain
BLOCKCHAIN_NETWORK=polygon-amoy
CONTRACT_ADDRESS=0x7d6159A7cBd7061AA231288651e750B5c5046343
PRIVATE_KEY=your-private-key-for-relayer
PROVIDER_URL=https://rpc-amoy.polygon.technology
```

---

## � Complete API Reference

### Authentication Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/student/register` | No | Register new student |
| POST | `/api/auth/student/login` | No | Student login |
| GET | `/api/auth/student/profile` | Yes | Get student profile |
| POST | `/api/admin/login` | No | Admin login |
| GET | `/api/admin/profile` | Yes | Get admin profile |
| POST | `/api/university/register` | No | Register university (multipart) |
| POST | `/api/university/login` | No | University login |
| GET | `/api/university/profile` | Yes | Get university profile |

### Student Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/student/dashboard` | Yes | Get student dashboard |
| GET | `/api/student/certificates` | Yes | List all certificates |
| GET | `/api/student/certificates/:certificateId` | Yes | Get certificate details |
| GET | `/api/student/certificates/:certificateId/verify` | Yes | Verify certificate on blockchain |
| POST | `/api/student/career-insights` | Yes | Get AI career analysis (Gemini) |

### University Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/university/dashboard` | Yes | University dashboard |
| POST | `/api/university/certificate/issue` | Yes | Issue single certificate |
| POST | `/api/university/certificates/bulk` | Yes | Bulk issue certificates |
| GET | `/api/university/certificates` | Yes | List issued certificates |
| POST | `/api/university/certificate/sign-payload` | Yes | Get message hash for signing |
| POST | `/api/university/certificate/issue-signed` | Yes | Issue with signature |
| POST | `/api/university/certificate/bulk-auth` | Yes | Get bulk auth message |
| POST | `/api/university/certificate/bulk-issue-signed` | Yes | Bulk issue with signature |

### Admin Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | Yes | Admin dashboard |
| GET | `/api/admin/institutes` | Yes | List all institutes |
| GET | `/api/admin/institutes/pending` | Yes | List pending institutes |
| GET | `/api/admin/institutes/:institute_id/issuer-status` | Yes | Check issuer status |
| POST | `/api/admin/institutes/:institute_id/approve` | Yes | Approve institute |
| POST | `/api/admin/institutes/:institute_id/reject` | Yes | Reject institute |
| POST | `/api/admin/institutes/:institute_id/revoke` | Yes | Revoke institute |
| GET | `/api/admin/statistics` | Yes | Get system statistics |
| GET | `/api/admin/blockchain/status` | Yes | Get blockchain status |

### Payment & Blockchain Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payment/gas-cost` | No | Get gas cost per cert |
| GET | `/api/payment/balance?address=0x...` | No | Get wallet balance |
| POST | `/api/payment/issue-with-metamask` | No | Issue with MetaMask payment |
| POST | `/api/payment/bulk-issue` | No | Bulk issue with payment |
| POST | `/api/certificates/issue-with-metamask` | No | Issue with MetaMask sig |
| GET | `/api/metamask/status` | No | Get MetaMask config |

### Public Verification Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/verify/certificate/:certificateId` | No | Verify certificate |
| GET | `/api/verify/user/:userId` | No | List user certificates |

---

## 🔧 Dependencies

```json
{
  "@google/generative-ai": "^0.24.1",  // Gemini AI 2.5 Flash for Career Insights
  "express": "^5.2.1",                  // Web framework
  "mysql2": "^3.7.0",                   // MySQL driver
  "bcrypt": "^5.1.1",                   // Password hashing
  "jsonwebtoken": "^9.0.2",             // JWT authentication
  "dotenv": "^17.2.3",                  // Environment variables
  "multer": "^2.0.2",                   // File upload
  "cors": "^2.8.5",                     // CORS middleware
  "ethers": "^5.8.0",                   // Ethereum/Polygon interaction
  "uuid": "^9.0.1",                     // UUID generation
  "papaparse": "^5.5.3",                // CSV parsing
  "pdfkit": "^0.15.0"                   // PDF generation
}
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Add GEMINI_API_KEY from Google AI Studio
- [ ] Configure DATABASE credentials
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS only
- [ ] Configure CORS for your frontend domain
- [ ] Set strong blockchain PRIVATE_KEY
- [ ] Enable rate limiting
- [ ] Setup error logging
- [ ] Backup database regularly

### Environment for Production
```dotenv
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-long-random-string-min-32-chars
GEMINI_API_KEY=your-gemini-key
```

---

## ✨ Key Features

### 🎓 Student Features
- **User Registration & Authentication**: Secure JWT-based login
- **Certificate Dashboard**: View all issued certificates
- **Blockchain Verification**: Verify certificates on Polygon blockchain
- **AI Career Insights**: Get personalized career recommendations using Google Gemini AI
- **Public Verification**: Share certificate link with anyone for verification

### 🏫 University Features
- **Institute Administration**: Manage certificate issuance
- **Single Certificate Issuance**: Issue certificates one at a time
- **Bulk Certificate Issuance**: Issue multiple certificates in one operation
- **MetaMask Integration**: Sign certificates with MetaMask wallet
- **Signature-Based Issuance**: Use cryptographic signatures for authorization
- **Blockchain Submission**: Certificates recorded on Polygon blockchain
- **Prepaid Gas Management**: Pay for blockchain transactions upfront

### 👨‍💼 Admin Features
- **Institute Management**: Approve/reject university registrations
- **Blockchain Authorization**: Authorize institutes as valid issuers
- **System Statistics**: Monitor total students, institutes, certificates
- **Pending Review Queue**: Review pending institute applications
- **Blockchain Status**: Check blockchain integration status

### 🔐 Security Features
- **JWT Token Authentication**: Secure API access with 7-day expiry
- **Password Hashing**: bcrypt for secure password storage
- **Blockchain Verification**: Tamper-proof certificate records
- **Role-Based Access Control**: Different endpoints for students/universities/admins
- **MetaMask Signature Verification**: Verify wallet ownership

### 📊 Advanced Features
- **AI-Powered Career Analysis**: Gemini AI analyzes certificates and suggests careers
- **Polygon Blockchain**: Uses Polygon Amoy testnet for cost-effective transactions
- **File Upload**: Support for institution logos and verification documents
- **Prepaid Gas System**: Universities prepay for blockchain transactions
- **Bulk Operations**: Batch issue multiple certificates with single signature

---

## 🚀 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT + bcrypt |
| **Blockchain** | Polygon (Amoy Testnet), ethers.js |
| **Smart Contract** | Solidity on Polygon |
| **AI/ML** | Google Generative AI (Gemini 2.5 Flash) |
| **File Upload** | Multer |
| **Environment** | dotenv |
| **CORS** | CORS middleware |

---

## 🧪 Testing APIs with cURL

### Register Student
```bash
curl -X POST http://localhost:3001/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "gender": "Male",
    "birthdate": "2000-01-15"
  }'
```

### Login Student
```bash
curl -X POST http://localhost:3001/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Dashboard (with token)
```bash
curl -X GET http://localhost:3001/api/student/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Gas Cost
```bash
curl -X GET http://localhost:3001/api/payment/gas-cost
```

### Get Wallet Balance
```bash
curl -X GET "http://localhost:3001/api/payment/balance?address=0x742d35Cc6634C0532925a3b844Bc908e5c4e5e2f"
```

### Verify Certificate (Public)
```bash
curl -X GET http://localhost:3001/api/verify/certificate/CERT123456
```

### Get Career Insights
```bash
curl -X POST http://localhost:3001/api/student/career-insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerate": false}'
```

### Issue Certificate with MetaMask
```bash
curl -X POST http://localhost:3001/api/payment/issue-with-metamask \
  -H "Content-Type: application/json" \
  -d '{
    "certId": "CERT123",
    "studentName": "John Doe",
    "courseName": "Blockchain 101",
    "issueDate": "2026-01-15",
    "issuerName": "Tech University",
    "messageHash": "0x...",
    "signature": "0x...",
    "signerAddress": "0x742d..."
  }'
```

---

## 🆕 Recent Changes & Enhancements

### Latest Updates (February 2026)

**Blockchain & Bulk Issuance Improvements:**
- ✅ Enhanced bulk certificate issuance with better error handling
- ✅ Added support for both camelCase and snake_case field names in bulk operations
- ✅ Implemented automatic field normalization for certificate data
- ✅ Added blockchain_status tracking (pending/submitted/confirmed)
- ✅ Added blockchain_timestamp field to track blockchain submission time
- ✅ Improved transaction status reporting with detailed gas usage metrics

**Database Schema Updates:**
- ✅ New `blockchain_status` field in certificates table (ENUM: pending, submitted, confirmed)
- ✅ New `blockchain_timestamp` field to track when certificate was submitted to blockchain
- ✅ New `summary` field in career_paths table for AI-generated career summaries

**AI & Configuration:**
- ✅ Upgraded Gemini AI from v0.1.3 to v0.24.1
- ✅ Switched AI model from Gemini 1.5 Pro to Gemini 2.5 Flash for faster responses
- ✅ Added `.env.example` file with complete configuration template
- ✅ Added comprehensive `.gitignore` for better repository management

**Code Quality & Maintenance:**
- ✅ Removed unused database migration scripts (seed_admin.sql, update_institutes.sql)
- ✅ Removed deprecated Institute model methods
- ✅ Enhanced error logging and debugging output for bulk operations
- ✅ Improved student dashboard with enhanced statistics

**Documentation:**
- ✅ Added comprehensive Setup & Configuration section
- ✅ Updated API documentation with latest endpoints
- ✅ Enhanced troubleshooting guide
- ✅ Updated dependency versions and descriptions

---

## 📞 Support & Troubleshooting

For issues or questions:
1. Check error messages in response
2. Verify all required fields are provided
3. Ensure JWT token is valid (not expired)
4. Check database connectivity
5. Review console logs on server

### Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED - Database connection failed` | Check MySQL is running and credentials in .env |
| `"GEMINI_API_KEY not set"` | Add GEMINI_API_KEY to .env from aistudio.google.com |
| `"MetaMask not detected"` | Install MetaMask browser extension |
| `"Wrong blockchain network"` | Switch MetaMask to Polygon Amoy (Chain ID: 80002) |
| `"Insufficient balance"` | Check wallet balance via /api/payment/balance |
| `"Certificate not found on blockchain"` | Verify tx hash and wait for confirmation |

### Debug Mode
```bash
# Run server with debug logging
DEBUG=cert-system:* npm start

# Check blockchain status
curl http://localhost:3001/api/admin/blockchain/status \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

**Status:** ✅ Production Ready  
**Version:** 2.0  
**Last Updated:** February 5, 2026
