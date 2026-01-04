// Certificate Verification System - Main Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// =========================================
// MIDDLEWARE
// =========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
// FRONTEND ROUTES
// =========================================

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Student pages
app.get('/student/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'register.html'));
});

app.get('/student/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'login.html'));
});

app.get('/student/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

// University pages
app.get('/university/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'university', 'register.html'));
});

app.get('/university/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'university', 'login.html'));
});

app.get('/university/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'university', 'dashboard.html'));
});

// Admin pages
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Public verification page
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🎓 Certificate Verification System');
  console.log('=====================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Contract: ${process.env.CONTRACT_ADDRESS}`);
  console.log('\n📱 Access Points:');
  console.log(`   Student Portal: http://localhost:${PORT}/student/login`);
  console.log(`   University Portal: http://localhost:${PORT}/university/login`);
  console.log(`   Admin Panel: http://localhost:${PORT}/admin/login`);
  console.log(`   Public Verify: http://localhost:${PORT}/verify`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log('=====================================\n');
});
