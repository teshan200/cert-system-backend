// Student Controller - Dashboard and certificate operations
const Student = require('../models/Student');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

// Get student dashboard data with enhanced statistics and institutions
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get student info
    const student = await Student.findById(userId);
    
    // Get certificates
    const certificates = await Student.getCertificates(userId);

    // Calculate statistics
    const blockchainVerifiedCount = certificates.filter(cert => cert.blockchain_tx_hash).length;
    
    // Get unique institutions
    const institutionsMap = new Map();
    certificates.forEach(cert => {
      if (!institutionsMap.has(cert.institute_id)) {
        institutionsMap.set(cert.institute_id, {
          institute_id: cert.institute_id,
          institute_name: cert.institute_name,
          logo_url: cert.logo_url,
          certificateCount: 0
        });
      }
      institutionsMap.get(cert.institute_id).certificateCount++;
    });
    const institutions = Array.from(institutionsMap.values());

    // Calculate active certificates count (no expiry or expiry > current date)
    const today = new Date();
    const activeCertificatesCount = certificates.filter(cert => {
      if (!cert.expiry_date) return true;
      return new Date(cert.expiry_date) > today;
    }).length;

    res.json({
      success: true,
      student: {
        userId: student.user_id,
        full_name: student.full_name,
        email: student.email,
        gender: student.gender,
        birthdate: student.birthdate
      },
      certificates: certificates,
      statistics: {
        totalCertificates: certificates.length,
        blockchainVerifiedCount: blockchainVerifiedCount,
        institutionsCount: institutions.length,
        activeCertificatesCount: activeCertificatesCount
      },
      institutions: institutions
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all student certificates
exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user.userId;
    const certificates = await Student.getCertificates(userId);

    res.json({
      success: true,
      certificates
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single certificate details
exports.getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.userId;

    const query = `
      SELECT 
        c.*,
        i.institute_name,
        i.wallet_address as issuer_wallet,
        i.logo_url
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      WHERE c.certificate_id = ? AND c.user_id = ?
    `;

    const db = require('../config/database');
    const [rows] = await db.execute(query, [certificateId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({
      success: true,
      certificate: rows[0]
    });

  } catch (error) {
    console.error('Get certificate details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify certificate on blockchain
exports.verifyCertificateOnBlockchain = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.userId;
    const blockchain = require('../utils/blockchain');
    const db = require('../config/database');

    // Get certificate from database
    const query = `
      SELECT c.*, i.institute_name
      FROM certificates c
      JOIN institutes i ON c.institute_id = i.institute_id
      WHERE c.certificate_id = ? AND c.user_id = ?
    `;

    const [rows] = await db.execute(query, [certificateId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const dbCert = rows[0];

    // Verify on blockchain
    const blockchainResult = await blockchain.verifyCertificate(certificateId);

    if (!blockchainResult.verified) {
      return res.json({
        verified: false,
        onBlockchain: false,
        message: 'Certificate not found on blockchain'
      });
    }

    // Compare data
    const comparison = blockchain.compareData(dbCert, blockchainResult.data);

    res.json({
      verified: true,
      onBlockchain: true,
      databaseCert: {
        certificateId: dbCert.certificate_id,
        courseName: dbCert.course,
        grade: dbCert.grade,
        issueDate: dbCert.issued_date,
        issuerName: dbCert.institute_name,
        transactionHash: dbCert.blockchain_tx_hash
      },
      blockchainCert: blockchainResult.data,
      comparison: comparison,
      message: comparison.match ? '✅ Certificate verified on blockchain!' : '⚠️ Data mismatch'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get AI-powered career insights using Gemini API
exports.getCareerInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { regenerate } = req.body;

    // Get student info
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get student certificates
    const certificates = await Student.getCertificates(userId);
    if (certificates.length === 0) {
      return res.status(400).json({ 
        error: 'No certificates found. Add certificates to get career insights.' 
      });
    }

    // Check if cached insights exist and regenerate is false
    if (!regenerate) {
      const cacheQuery = `
        SELECT * FROM career_paths 
        WHERE user_id = ? 
        ORDER BY generated_at DESC 
        LIMIT 1
      `;
      const [cachedResult] = await db.execute(cacheQuery, [userId]);
      
      if (cachedResult.length > 0) {
        try {
          const cached = cachedResult[0];
          return res.json({
            success: true,
            insights: {
              careerMatches: JSON.parse(cached.career_suggestions),
              topSkills: JSON.parse(cached.skills_identified),
              nextSteps: JSON.parse(cached.recommended_courses),
              summary: cached.summary || 'Career analysis based on your certificates.',
              generatedAt: cached.generated_at
            }
          });
        } catch (parseError) {
          console.warn('Error parsing cached insights, regenerating...', parseError);
        }
      }
    }

    // Initialize Gemini API
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare certificate data for Gemini
    const certificateData = certificates.map(cert => ({
      title: cert.certificate_title,
      course: cert.course,
      grade: cert.grade || 'N/A',
      institution: cert.institute_name,
      issuedDate: cert.issued_date,
      expiryDate: cert.expiry_date
    }));

    // Create prompt for Gemini
    const prompt = `
You are a career counselor AI specializing in education and skill analysis. 
Analyze the following student's certificates and academic achievements to provide career insights.

STUDENT INFORMATION:
- Name: ${student.full_name}
- Email: ${student.email}

CERTIFICATES AND ACHIEVEMENTS:
${certificateData.map((cert, idx) => `
${idx + 1}. Certificate: ${cert.title}
   - Course: ${cert.course}
   - Grade: ${cert.grade}
   - Institution: ${cert.institution}
   - Issued: ${cert.issuedDate}
   - Expires: ${cert.expiryDate || 'No expiration'}
`).join('\n')}

Based on this academic profile, provide a comprehensive career analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "careerMatches": [
    {
      "title": "Job title",
      "matchPercentage": 85
    }
  ],
  "topSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "nextSteps": [
    {
      "step": "Step 1: Title",
      "title": "Action title",
      "description": "Detailed description of what to do",
      "completed": false
    }
  ],
  "summary": "Professional 2-3 paragraph summary of career path"
}

Requirements:
1. Generate 3-4 realistic career matches with match percentages (60-95%)
2. Extract and infer 5-7 relevant skills from the certificates
3. Create 4-5 actionable next steps for career progression
4. Write a professional summary (2-3 paragraphs) about the student's career potential
5. Ensure all values are realistic and achievable based on the certificates shown
`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse Gemini response
    let insightsData;
    try {
      // Extract JSON from response (in case Gemini adds markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }
      insightsData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: parseError.message 
      });
    }

    // Validate response structure
    if (!insightsData.careerMatches || !insightsData.topSkills || !insightsData.nextSteps) {
      return res.status(500).json({ 
        error: 'Invalid response structure from AI' 
      });
    }

    // Store insights in database
    const insertQuery = `
      INSERT INTO career_paths (user_id, career_suggestions, skills_identified, recommended_courses, summary)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(insertQuery, [
      userId,
      JSON.stringify(insightsData.careerMatches),
      JSON.stringify(insightsData.topSkills),
      JSON.stringify(insightsData.nextSteps),
      insightsData.summary
    ]);

    res.json({
      success: true,
      insights: {
        careerMatches: insightsData.careerMatches,
        topSkills: insightsData.topSkills,
        nextSteps: insightsData.nextSteps,
        summary: insightsData.summary,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Career insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate career insights',
      details: error.message 
    });
  }
};
