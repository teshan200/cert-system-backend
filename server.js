// Certificate Verification System - Main Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();

// =========================================
// MIDDLEWARE
// =========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import auth middleware
const { verifyToken } = require('./middleware/auth');
const fs = require('fs');

// Public: logos (no auth required)
app.use('/uploads/institutes/logos', express.static('public/uploads/institutes/logos'));

// Private: documents (requires authentication)
app.use('/uploads/institutes/documents', verifyToken, express.static('public/uploads/institutes/documents'));

// Public: student profile photos and CVs (no auth required for public portfolios)
app.use('/uploads/students', express.static('public/uploads/students'));

// Protected API endpoint for documents (requires authentication)
app.get('/api/files/:filename', verifyToken, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'public', 'uploads', 'institutes', 'documents', filename);
  
  // Prevent directory traversal attacks
  const realpath = path.resolve(filepath);
  const allowedDir = path.resolve(path.join(__dirname, 'public', 'uploads', 'institutes', 'documents'));
  
  if (!realpath.startsWith(allowedDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set proper content type for PDFs
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(filepath));
  res.sendFile(filepath);
});

// =========================================
// DATABASE CONNECTION TEST
// =========================================
const db = require('./config/database');

// =========================================
// API ROUTES
// =========================================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const universityRoutes = require('./routes/university');
const adminRoutes = require('./routes/admin');
const metamaskRoutes = require('./routes/metamask-routes');
const paymentRoutes = require('./routes/payment');
const verifyRoutes = require('./routes/verify');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/metamask', metamaskRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/verify', verifyRoutes);

// =========================================
// HEALTH CHECK
// =========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    blockchain: process.env.CONTRACT_ADDRESS
  });
});

// =========================================
// ERROR HANDLING
// =========================================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// =========================================
// START SERVER
// =========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🎓 Certificate Verification System - Backend API');
  console.log('=====================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Contract: ${process.env.CONTRACT_ADDRESS}`);
  console.log('\n📱 API Endpoints:');
  console.log(`   Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`   Student: http://localhost:${PORT}/api/student/*`);
  console.log(`   University: http://localhost:${PORT}/api/university/*`);
  console.log(`   Admin: http://localhost:${PORT}/api/admin/*`);
  console.log(`   Verify: http://localhost:${PORT}/api/verify/*`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log('=====================================\n');
});
