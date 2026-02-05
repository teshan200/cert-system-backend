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
8. [AI Career Insights](#ai-career-insights) ⭐ NEW
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)
11. [Frontend Integration](#frontend-integration)

---

## 🚀 Quick Start

### Installation
```bash
npm install
npm start
```

### Add Gemini API Key (for AI features)
```bash
# Edit .env
GEMINI_API_KEY=your_api_key_from_https://aistudio.google.com/app/apikey
```

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

## 🔐 Authentication

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

## 🤖 AI Career Insights (NEW) ⭐

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
- ✅ Uses Google Gemini 1.5 Pro AI
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
  "blockchain_verified": "Boolean",
  "created_at": "Timestamp"
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

### JavaScript Fetch Example

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
```

---

## 📁 Project Structure

```
cert-system/
├── config/           # Database configuration
├── controllers/      # Route controllers
│   ├── studentController.js     (Student endpoints + AI Career Insights)
│   ├── universityController.js  (University endpoints)
│   ├── adminController.js       (Admin endpoints)
│   └── authController.js        (Authentication)
├── routes/          # Route definitions
│   ├── student.js
│   ├── university.js
│   ├── admin.js
│   └── auth.js
├── models/          # Data models
│   ├── Student.js
│   ├── Institute.js
│   └── Admin.js
├── middleware/      # Middleware (auth, upload, etc)
├── database/        # Database schemas
├── utils/           # Utilities (blockchain, etc)
├── public/          # Static files & uploads
├── .env             # Environment configuration
├── package.json     # Dependencies
└── server.js        # Main server file
```

---

## 🔧 Dependencies

```json
{
  "@google/generative-ai": "^0.1.3",  // Gemini AI for Career Insights
  "express": "^5.2.1",
  "mysql2": "^3.7.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^17.2.3",
  "multer": "^2.0.2",
  "cors": "^2.8.5",
  "ethers": "^5.8.0"
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

## 📞 Support

For issues or questions:
1. Check error messages in response
2. Verify all required fields are provided
3. Ensure JWT token is valid (not expired)
4. Check database connectivity
5. Review console logs on server

---

**Status:** ✅ Production Ready  
**Version:** 2.0  
**Last Updated:** February 5, 2026
