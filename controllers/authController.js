// Authentication Controller
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { full_name, email, password, gender, birthdate } = req.body;

    // Validation
    if (!full_name || !email || !password || !gender || !birthdate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const emailExists = await Student.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      full_name,
      email,
      password_hash,
      gender,
      birthdate
    });

    // Generate token
    const token = generateToken(student.userId, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      userId: student.userId,
      token,
      student: {
        userId: student.userId,
        full_name,
        email,
        gender,
        birthdate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Student Login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find student
    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(student.user_id, 'student');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        userId: student.user_id,
        full_name: student.full_name,
        email: student.email,
        gender: student.gender,
        birthdate: student.birthdate
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      student
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
