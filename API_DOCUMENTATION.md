# Certificate Verification System - API Documentation

**Base URL:** `http://localhost:3001`  
**Version:** 1.0  
**Last Updated:** January 8, 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [Student API](#student-api)
3. [University API](#university-api)
4. [Admin API](#admin-api)
5. [Public Verify API](#public-verify-api)
6. [File Upload](#file-upload)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

---

## Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

**Token Expiry:** 7 days  
**Token Payload:**
```json
{
  "userId": "string" or "institute_id": "string" or "admin_id": "string",
  "role": "student" | "university" | "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Student API

### 1. Register Student

**POST** `/api/auth/student/register`

Register a new student account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "Male",
  "birthdate": "2000-01-15"
}
```

**Validation:**
- `email`: Valid email format required
- `password`: Minimum 6 characters
- `gender`: Must be "Male", "Female", or "Other"
- `birthdate`: Date format (YYYY-MM-DD)

**Response (201):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "userId": "STU123456789",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "birthdate": "2000-01-15"
  }
}
```

**Errors:**
- `400`: Missing fields, invalid email/password format
- `400`: Email already registered
- `500`: Server error

---

### 2. Student Login

**POST** `/api/auth/student/login`

Authenticate a student and get JWT token.

**Request Body:**
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
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "birthdate": "2000-01-15"
  }
}
```

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

---

### 3. Get Student Profile

**GET** `/api/auth/student/profile`

Get current authenticated student's profile.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "student": {
    "user_id": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "birthdate": "2000-01-15",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `403`: No token provided
- `401`: Invalid/expired token
- `404`: Student not found

---

### 4. Get Student Dashboard

**GET** `/api/student/dashboard`

Get dashboard data including student info and certificates count.

**Headers:**
```http
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "success": true,
  "student": {
    "userId": "STU123456789",
    "full_name": "John Doe",
    "email": "john@example.com",
    "gender": "Male",
    "birthdate": "2000-01-15"
  },
  "certificates": [
    {
      "certificate_id": "CERT123",
      "certificate_title": "Blockchain Certification",
      "course": "Blockchain Fundamentals",
      "institute_name": "Tech University",
      "issued_date": "2026-01-01",
      "grade": "A",
      "blockchain_tx_hash": "0x123..."
    }
  ],
  "totalCertificates": 1
}
```

---

### 5. Get All Certificates

**GET** `/api/student/certificates`

Get all certificates for the authenticated student.

**Headers:**
```http
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "success": true,
  "certificates": [
    {
      "certificate_id": "CERT123",
      "user_id": "STU123456789",
      "institute_id": "UNI456",
      "certificate_title": "Blockchain Certification",
      "course": "Blockchain Fundamentals",
      "issued_date": "2026-01-01",
      "expiry_date": null,
      "grade": "A",
      "blockchain_tx_hash": "0x123...",
      "institute_name": "Tech University",
      "logo_url": "/uploads/institutes/logos/uni-logo.png"
    }
  ]
}
```

---

### 6. Get Certificate Details

**GET** `/api/student/certificates/:certificateId`

Get detailed information for a specific certificate.

**Parameters:**
- `certificateId` (path): The certificate ID

**Headers:**
```http
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "success": true,
  "certificate": {
    "certificate_id": "CERT123",
    "user_id": "STU123456789",
    "institute_id": "UNI456",
    "certificate_title": "Blockchain Certification",
    "course": "Blockchain Fundamentals",
    "issued_date": "2026-01-01",
    "grade": "A",
    "blockchain_tx_hash": "0x123...",
    "institute_name": "Tech University",
    "issuer_wallet": "0xABC...",
    "logo_url": "/uploads/institutes/logos/uni-logo.png"
  }
}
```

**Errors:**
- `404`: Certificate not found or not owned by student

---

### 7. Verify Certificate on Blockchain

**GET** `/api/student/certificates/:certificateId/verify`

Verify a certificate against blockchain data.

**Parameters:**
- `certificateId` (path): The certificate ID

**Headers:**
```http
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "verified": true,
  "onBlockchain": true,
  "databaseCert": {
    "certificateId": "CERT123",
    "courseName": "Blockchain Fundamentals",
    "grade": "A",
    "issueDate": "2026-01-01",
    "issuerName": "Tech University",
    "transactionHash": "0x123..."
  },
  "blockchainCert": {
    "certificateId": "CERT123",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "issueDate": "2026-01-01",
    "issuerName": "Tech University"
  },
  "comparison": {
    "match": true
  },
  "message": "✅ Certificate verified on blockchain!"
}
```

---

## University API

### 1. Register University

**POST** `/api/university/register`

Register a new university/institute (requires admin approval).

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `institute_name`: string (required)
- `email`: string (required, unique)
- `password`: string (required, min 6 chars)
- `wallet_address`: string (required, must start with 0x, 42 chars)
- `logo`: file (optional, image)
- `verification_doc`: file (required, PDF/document for admin verification)

**Example (using FormData):**
```javascript
const formData = new FormData();
formData.append('institute_name', 'Tech University');
formData.append('email', 'admin@techuni.edu');
formData.append('password', 'securePass123');
formData.append('wallet_address', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
formData.append('logo', logoFile); // File object
formData.append('verification_doc', docFile); // File object

fetch('http://localhost:3001/api/university/register', {
  method: 'POST',
  body: formData
});
```

**Response (201):**
```json
{
  "message": "Institute registered successfully. Awaiting admin approval.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "email": "admin@techuni.edu",
    "logo_url": "/uploads/institutes/logos/logo-123.png",
    "verification_doc_url": "/uploads/institutes/documents/doc-123.pdf"
  }
}
```

**Errors:**
- `400`: Missing required fields
- `400`: Invalid email/wallet format
- `400`: Password too short
- `400`: Verification document required
- `409`: Email or wallet already registered
- `500`: Server error

---

### 2. University Login

**POST** `/api/university/login`

Authenticate a university account.

**Request Body:**
```json
{
  "email": "admin@techuni.edu",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "email": "admin@techuni.edu"
  }
}
```

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `403`: Institute not approved (status: pending/rejected)
- `500`: Server error

---

### 3. Get University Profile

**GET** `/api/university/profile`

Get current authenticated university's profile.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Response (200):**
```json
{
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "email": "admin@techuni.edu",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "verification_status": "approved",
    "logo_url": "/uploads/institutes/logos/logo-123.png",
    "verification_doc_url": "/uploads/institutes/documents/doc-123.pdf",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Get University Dashboard

**GET** `/api/university/dashboard`

Get dashboard statistics for the university.

**Headers:**
```http
Authorization: Bearer <university_token>
```

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

Issue a new certificate to a student (stored in DB and blockchain).

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Request Body:**
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
    "grade": "A",
    "issued_date": "2026-01-01",
    "blockchain_tx_hash": "0x123...",
    "blockchain_receipt": {
      "transactionHash": "0x123...",
      "blockNumber": 12345,
      "gasUsed": "150000"
    }
  }
}
```

**Errors:**
- `400`: Missing required fields
- `404`: Student not found
- `500`: Blockchain transaction failed
- `500`: Database error

---

### 6. Get Certificate Signature Payload

**POST** `/api/university/certificate/sign-payload`

Get payload for MetaMask signing before issuing certificate.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Request Body:**
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
  "certificate_id": "CERT123",
  "payload": {
    "certificateId": "CERT123",
    "studentName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "issueDate": "2026-01-01",
    "issuerName": "Tech University"
  },
  "message": "Sign this message with MetaMask to authorize certificate issuance"
}
```

---

### 7. Issue Certificate with Signature

**POST** `/api/university/certificate/issue-signed`

Issue certificate using pre-signed MetaMask signature.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Request Body:**
```json
{
  "certificate_id": "CERT123",
  "student_id": "STU123456789",
  "course_name": "Blockchain Fundamentals",
  "grade": "A",
  "signature": "0x123abc..." 
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued with signature",
  "certificate_id": "CERT123",
  "blockchain_tx_hash": "0x456def..."
}
```

---

### 8. Get Bulk Authorization Message

**POST** `/api/university/certificate/bulk-auth`

Get authorization message for bulk certificate issuance.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Request Body:**
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
  "authMessage": "Authorize bulk issuance of 2 certificates",
  "certificateIds": ["CERT123", "CERT124"],
  "certificates": [
    {
      "certificate_id": "CERT123",
      "student_id": "STU111",
      "course_name": "Course A",
      "grade": "A"
    },
    {
      "certificate_id": "CERT124",
      "student_id": "STU222",
      "course_name": "Course B",
      "grade": "B"
    }
  ]
}
```

---

### 9. Bulk Issue with Single Signature

**POST** `/api/university/certificate/bulk-issue-signed`

Issue multiple certificates with one MetaMask signature.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Request Body:**
```json
{
  "signature": "0x123abc...",
  "certificates": [
    {
      "certificate_id": "CERT123",
      "student_id": "STU111",
      "course_name": "Course A",
      "grade": "A"
    },
    {
      "certificate_id": "CERT124",
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
  "message": "Bulk issuance completed",
  "results": [
    {
      "certificate_id": "CERT123",
      "success": true,
      "tx_hash": "0x456def..."
    },
    {
      "certificate_id": "CERT124",
      "success": true,
      "tx_hash": "0x789ghi..."
    }
  ],
  "successCount": 2,
  "failureCount": 0
}
```

---

### 10. Get All University Certificates

**GET** `/api/university/certificates`

Get all certificates issued by this university.

**Headers:**
```http
Authorization: Bearer <university_token>
```

**Response (200):**
```json
{
  "total": 150,
  "certificates": [
    {
      "certificate_id": "CERT123",
      "user_id": "STU123456789",
      "student_name": "John Doe",
      "course": "Blockchain Fundamentals",
      "issued_date": "2026-01-01",
      "grade": "A",
      "blockchain_tx_hash": "0x123..."
    }
  ]
}
```

---

### 11. Bulk Issue Certificates (CSV Upload)

**POST** `/api/university/certificates/bulk`

Issue multiple certificates from CSV data.

**Headers:**
```http
Authorization: Bearer <university_token>
Content-Type: application/json
```

**Request Body:**
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
  "message": "Bulk issuance completed",
  "results": [
    {
      "student_id": "STU111",
      "certificate_id": "CERT123",
      "success": true
    },
    {
      "student_id": "STU222",
      "certificate_id": "CERT124",
      "success": true
    }
  ],
  "successCount": 2,
  "failureCount": 0
}
```

---

## Admin API

### 1. Admin Login

**POST** `/api/admin/login`

Authenticate an admin user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "admin_id": "ADMIN001",
    "username": "admin"
  }
}
```

**Errors:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Server error

---

### 2. Get Admin Profile

**GET** `/api/admin/profile`

Get current authenticated admin's profile.

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "admin": {
    "admin_id": "ADMIN001",
    "username": "admin",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Admin Dashboard

**GET** `/api/admin/dashboard`

Get dashboard statistics and pending approvals.

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "statistics": {
    "totalStudents": 500,
    "totalInstitutes": 25,
    "totalCertificates": 1200,
    "approvedInstitutes": 20,
    "pendingInstitutes": 3,
    "rejectedInstitutes": 2
  },
  "pendingInstitutes": [
    {
      "institute_id": "UNI456",
      "institute_name": "Tech University",
      "email": "admin@techuni.edu",
      "wallet_address": "0x742d35Cc...",
      "verification_status": "pending",
      "logo_url": "/uploads/institutes/logos/logo-123.png",
      "verification_doc_url": "/uploads/institutes/documents/doc-123.pdf",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "totalPending": 3
}
```

---

### 4. Get All Institutes

**GET** `/api/admin/institutes`

Get all registered institutes (all statuses).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total": 25,
  "institutes": [
    {
      "institute_id": "UNI456",
      "institute_name": "Tech University",
      "email": "admin@techuni.edu",
      "wallet_address": "0x742d35Cc...",
      "verification_status": "approved",
      "logo_url": "/uploads/institutes/logos/logo-123.png",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Pending Institutes

**GET** `/api/admin/institutes/pending`

Get only institutes awaiting approval.

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total": 3,
  "institutes": [
    {
      "institute_id": "UNI456",
      "institute_name": "Tech University",
      "email": "admin@techuni.edu",
      "wallet_address": "0x742d35Cc...",
      "verification_status": "pending",
      "verification_doc_url": "/uploads/institutes/documents/doc-123.pdf",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Get Issuer Status (Blockchain)

**GET** `/api/admin/institutes/:institute_id/issuer-status`

Check if an institute is authorized as an issuer on the blockchain.

**Parameters:**
- `institute_id` (path): The institute ID

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "institute_id": "UNI456",
  "wallet_address": "0x742d35Cc...",
  "isAuthorizedIssuer": true,
  "blockchainStatus": "authorized"
}
```

---

### 7. Approve Institute

**POST** `/api/admin/institutes/:institute_id/approve`

Approve a pending institute and authorize on blockchain.

**Parameters:**
- `institute_id` (path): The institute ID

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request Body:** (optional)
```json
{
  "notes": "Approved after document verification"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Institute approved and authorized on blockchain",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "verification_status": "approved"
  },
  "blockchain": {
    "authorized": true,
    "tx_hash": "0x123..."
  }
}
```

**Errors:**
- `404`: Institute not found
- `400`: Institute not in pending status
- `500`: Blockchain authorization failed

---

### 8. Reject Institute

**POST** `/api/admin/institutes/:institute_id/reject`

Reject a pending institute application.

**Parameters:**
- `institute_id` (path): The institute ID

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request Body:** (optional)
```json
{
  "reason": "Invalid verification documents"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Institute rejected",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "verification_status": "rejected"
  }
}
```

---

### 9. Revoke Institute Authorization

**POST** `/api/admin/institutes/:institute_id/revoke`

Revoke an approved institute's authorization on blockchain.

**Parameters:**
- `institute_id` (path): The institute ID

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Request Body:** (optional)
```json
{
  "reason": "Violations of terms of service"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Institute authorization revoked on blockchain",
  "institute": {
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "verification_status": "rejected"
  },
  "blockchain": {
    "revoked": true,
    "tx_hash": "0x456..."
  }
}
```

---

### 10. Get Statistics

**GET** `/api/admin/statistics`

Get system-wide statistics.

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "totalStudents": 500,
  "totalInstitutes": 25,
  "totalCertificates": 1200,
  "approvedInstitutes": 20,
  "pendingInstitutes": 3,
  "rejectedInstitutes": 2,
  "certificatesIssuedToday": 15,
  "certificatesIssuedThisMonth": 350
}
```

---

### 11. Get Blockchain Status

**GET** `/api/admin/blockchain/status`

Get blockchain connection and contract status.

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "connected": true,
  "network": "Polygon Amoy Testnet",
  "contractAddress": "0x13660206fF34b48b07422a6658BfD93242b6a126",
  "blockNumber": 12345678,
  "gasPrice": "30000000000"
}
```

---

## Public Verify API

### 1. Verify Certificate by ID

**GET** `/api/verify/certificate/:certificateId`

Verify a certificate using its certificate ID (public endpoint, no auth).

**Parameters:**
- `certificateId` (path): The certificate ID (e.g., CERT123)

**Response (200):**
```json
{
  "success": true,
  "certificate": {
    "certificate_id": "CERT123",
    "user_id": "STU123456789",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "institute_id": "UNI456",
    "institute_name": "Tech University",
    "issuer_wallet": "0x742d35Cc...",
    "logo_url": "/uploads/institutes/logos/logo-123.png",
    "certificate_title": "Blockchain Certification",
    "course": "Blockchain Fundamentals",
    "issued_date": "2026-01-01",
    "expiry_date": null,
    "grade": "A",
    "blockchain_tx_hash": "0x123..."
  },
  "onchain": {
    "checked": true,
    "verified": true,
    "data": {
      "certificateId": "CERT123",
      "studentName": "John Doe",
      "courseName": "Blockchain Fundamentals",
      "issueDate": "2026-01-01",
      "issuerName": "Tech University"
    },
    "comparison": {
      "match": true
    }
  }
}
```

**Errors:**
- `400`: Missing certificateId
- `404`: Certificate not found
- `500`: Server error

---

### 2. Get Certificates by User ID

**GET** `/api/verify/user/:userId`

Get all certificates for a student using their user ID (public endpoint, no auth).

**Parameters:**
- `userId` (path): The student user ID (e.g., STU123456789)

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
  },
  "certificates": [
    {
      "certificate_id": "CERT123",
      "user_id": "STU123456789",
      "institute_id": "UNI456",
      "institute_name": "Tech University",
      "issuer_wallet": "0x742d35Cc...",
      "logo_url": "/uploads/institutes/logos/logo-123.png",
      "certificate_title": "Blockchain Certification",
      "course": "Blockchain Fundamentals",
      "issued_date": "2026-01-01",
      "grade": "A",
      "blockchain_tx_hash": "0x123..."
    }
  ]
}
```

**Errors:**
- `400`: Missing userId
- `404`: Student not found
- `500`: Server error

---

## File Upload

### University Logo and Document Upload

When registering a university, files are uploaded using `multipart/form-data`.

**Accepted Files:**
- `logo`: Image files (PNG, JPG, JPEG) - max 5MB
- `verification_doc`: PDF or document files - max 10MB

**File URLs:**
- Logos: `/uploads/institutes/logos/logo-{timestamp}-{random}.{ext}`
- Documents: `/uploads/institutes/documents/doc-{timestamp}-{random}.{ext}`

**Accessing Files:**

**Public (Logo):**
```
http://localhost:3001/uploads/institutes/logos/logo-123.png
```

**Protected (Documents):**
```
http://localhost:3001/api/files/doc-123.pdf
Authorization: Bearer <token>
```

---

## Error Handling

### Standard Error Response Format

All errors return JSON with consistent structure:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created (successful registration/creation)
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid credentials, expired token)
- `403` - Forbidden (no token, wrong role, not approved)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email/wallet)
- `500` - Internal Server Error

### Common Error Messages

**Authentication:**
- `"No token provided"` - Missing Authorization header
- `"Invalid or expired token"` - JWT verification failed
- `"Access denied. Students only."` - Wrong role for endpoint
- `"Invalid credentials"` - Wrong email/password

**Validation:**
- `"All fields are required"` - Missing required fields
- `"Invalid email format"` - Email validation failed
- `"Password must be at least 6 characters"` - Password too short
- `"Invalid wallet address format"` - Wallet not 0x + 40 hex chars

**Resource:**
- `"Student not found"` - Student ID doesn't exist
- `"Certificate not found"` - Certificate ID doesn't exist
- `"Institute not found"` - Institute ID doesn't exist

**Business Logic:**
- `"Email already registered"` - Duplicate email
- `"Wallet already registered"` - Duplicate wallet
- `"Institute not approved. Status: pending"` - Login before approval

---

## Data Models

### Student
```typescript
{
  user_id: string;           // Auto-generated: "STU" + timestamp + random
  full_name: string;
  email: string;             // Unique
  password_hash: string;     // bcrypt hashed
  gender: "Male" | "Female" | "Other";
  birthdate: string;         // YYYY-MM-DD
  created_at: Date;
  updated_at: Date;
}
```

### Institute (University)
```typescript
{
  institute_id: string;      // Auto-generated: "UNI" + timestamp + random
  institute_name: string;
  email: string;             // Unique
  password_hash: string;     // bcrypt hashed
  wallet_address: string;    // Unique, 0x + 40 hex chars
  verification_status: "pending" | "approved" | "rejected";
  logo_url: string | null;
  verification_doc_url: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### Certificate
```typescript
{
  certificate_id: string;    // Auto-generated: "CERT" + timestamp + random
  user_id: string;           // FK to students.user_id
  institute_id: string;      // FK to institutes.institute_id
  certificate_title: string;
  course: string;
  issued_date: string;       // YYYY-MM-DD
  expiry_date: string | null;
  grade: string;
  blockchain_tx_hash: string | null;
  blockchain_verified: boolean;
  created_at: Date;
}
```

### Admin
```typescript
{
  admin_id: string;          // e.g., "ADMIN001"
  username: string;          // Unique
  password_hash: string;     // bcrypt hashed
  email: string;             // Unique
  created_at: Date;
}
```

---

## CORS Configuration

CORS is **enabled for all origins** in development. For production, configure specific origins:

```javascript
// Current (Development)
app.use(cors()); // All origins allowed

// Production (Recommended)
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## Rate Limiting

Currently **no rate limiting** is implemented. For production, add:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Environment Variables

Required `.env` configuration:

```env
# Server
PORT=3001

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cert_verification_system

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Blockchain
RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=0x13660206fF34b48b07422a6658BfD93242b6a126
PRIVATE_KEY=your_private_key_for_blockchain_transactions
```

---

## Quick Start Example (React)

### Setup Axios Client

```javascript
// src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Student Login

```javascript
import api from './api/client';

async function loginStudent(email, password) {
  try {
    const response = await api.post('/auth/student/login', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.student));
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error);
    throw error;
  }
}
```

### Get Student Certificates

```javascript
import api from './api/client';

async function getCertificates() {
  try {
    const response = await api.get('/student/certificates');
    return response.data.certificates;
  } catch (error) {
    console.error('Failed to fetch certificates:', error.response?.data?.error);
    throw error;
  }
}
```

### University Registration with File Upload

```javascript
import api from './api/client';

async function registerUniversity(data, logoFile, docFile) {
  try {
    const formData = new FormData();
    formData.append('institute_name', data.institute_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('wallet_address', data.wallet_address);
    
    if (logoFile) formData.append('logo', logoFile);
    if (docFile) formData.append('verification_doc', docFile);
    
    const response = await api.post('/university/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.error);
    throw error;
  }
}
```

### Public Certificate Verification

```javascript
import axios from 'axios';

async function verifyCertificate(certificateId) {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/verify/certificate/${certificateId}`
    );
    return response.data;
  } catch (error) {
    console.error('Verification failed:', error.response?.data?.error);
    throw error;
  }
}
```

---

## Support

For questions or issues:
- Check error messages in API responses
- Verify JWT token is not expired
- Ensure all required fields are provided
- Check user role matches endpoint requirements
- Verify institute is approved before login (universities)

---

**End of API Documentation**
