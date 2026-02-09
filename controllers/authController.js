// Authentication Controller
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { sendEmail } = require('../utils/mailer');
const {
  createVerificationToken,
  hashToken,
  buildVerificationUrl,
  buildVerificationEmail,
  renderVerificationPage
} = require('../utils/emailVerification');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const isEmailVerificationRequired = () => process.env.REQUIRE_EMAIL_VERIFICATION !== 'false';

const sendStudentVerificationEmail = async ({ name, email, token }) => {
  const verifyUrl = buildVerificationUrl('/api/auth/student/verify-email', token);
  const { subject, html, text } = buildVerificationEmail({
    name,
    verifyUrl,
    roleLabel: 'student'
  });
  await sendEmail({ to: email, subject, html, text });
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

    // Password strength (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
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

    const requiresVerification = isEmailVerificationRequired();
    if (requiresVerification) {
      const { token, tokenHash, expiresAt } = createVerificationToken();
      await Student.setEmailVerification(student.userId, tokenHash, expiresAt);

      let emailSent = true;
      try {
        await sendStudentVerificationEmail({ name: full_name, email, token });
      } catch (err) {
        console.error('Verification email error:', err.message);
        emailSent = false;
      }

      return res.status(201).json({
        success: true,
        message: emailSent
          ? 'Registration successful. Verification email sent.'
          : 'Registration successful. Verification email failed to send.',
        verification_required: true,
        email_sent: emailSent,
        userId: student.userId,
        student: {
          userId: student.userId,
          full_name,
          email,
          gender,
          birthdate
        }
      });
    }

    // Generate token
    const token = generateToken(student.userId, 'student');

    return res.status(201).json({
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

    if (isEmailVerificationRequired() && !student.email_verified) {
      return res.status(403).json({
        error: 'Email not verified. Please check your inbox.',
        verification_required: true
      });
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

// Verify student email
exports.verifyStudentEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Missing verification token.'
      }));
    }

    const tokenHash = hashToken(token);
    const student = await Student.findByVerificationToken(tokenHash);

    if (!student) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Invalid or expired verification link.'
      }));
    }

    if (student.email_verified) {
      return res.send(renderVerificationPage({
        success: true,
        message: 'Email already verified.'
      }));
    }

    if (student.email_verification_expires && new Date(student.email_verification_expires) < new Date()) {
      return res.status(400).send(renderVerificationPage({
        success: false,
        message: 'Verification link expired. Please request a new link.'
      }));
    }

    await Student.markEmailVerified(student.user_id);

    return res.send(renderVerificationPage({
      success: true,
      message: 'Email verified successfully. You can log in now.'
    }));
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).send(renderVerificationPage({
      success: false,
      message: 'Server error while verifying email.'
    }));
  }
};

// Resend student verification email
exports.resendStudentVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const { token, tokenHash, expiresAt } = createVerificationToken();
    await Student.setEmailVerification(student.user_id, tokenHash, expiresAt);
    await sendStudentVerificationEmail({ name: student.full_name, email: student.email, token });

    return res.json({
      success: true,
      message: 'Verification email sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Server error while sending verification email' });
  }
};
