// Admin Controller - Login, approve/reject universities, view statistics
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blockchain = require('../utils/blockchain');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find admin
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        admin_id: admin.admin_id,
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        admin_id: admin.admin_id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.admin_id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard data (statistics)
exports.getDashboard = async (req, res) => {
  try {
    const stats = await Admin.getStatistics();
    const pendingInstitutes = await Admin.getPendingInstitutes();

    res.json({
      statistics: stats,
      pendingInstitutes: pendingInstitutes,
      totalPending: pendingInstitutes.length
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all institutes
exports.getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Admin.getAllInstitutes();
    res.json({
      total: institutes.length,
      institutes
    });
  } catch (error) {
    console.error('Get institutes error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending institutes
exports.getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Admin.getPendingInstitutes();
    res.json({
      total: institutes.length,
      institutes
    });
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve institute
exports.approveInstitute = async (req, res) => {
  try {
    const { institute_id } = req.params;

    if (!institute_id) {
      return res.status(400).json({ error: 'Institute ID required' });
    }

    // Fetch institute info to get wallet address
    const institute = await Admin.getInstituteById(institute_id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    await Admin.approveInstitute(institute_id);

    // Try to add issuer on-chain; if it fails, still keep DB approval but surface warning
    let onchain = { success: false, error: null };
    try {
      const isAlready = await blockchain.isIssuer(institute.wallet_address);
      if (!isAlready) {
        const tx = await blockchain.addIssuer(institute.wallet_address);
        onchain = { success: true, txHash: tx.txHash, blockNumber: tx.blockNumber };
      } else {
        onchain = { success: true, note: 'Already issuer' };
      }
    } catch (err) {
      console.error('On-chain addIssuer failed:', err.message);
      onchain = { success: false, error: err.message };
    }

    res.json({
      message: 'Institute approved successfully',
      institute_id,
      wallet_address: institute.wallet_address,
      onchain
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reject institute
exports.rejectInstitute = async (req, res) => {
  try {
    const { institute_id } = req.params;
    const { reason } = req.body;

    if (!institute_id) {
      return res.status(400).json({ error: 'Institute ID required' });
    }

    await Admin.rejectInstitute(institute_id);

    res.json({
      message: 'Institute rejected successfully',
      institute_id,
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Revoke an approved institute and remove on-chain issuer
exports.revokeInstitute = async (req, res) => {
  try {
    const { institute_id } = req.params;

    if (!institute_id) {
      return res.status(400).json({ error: 'Institute ID required' });
    }

    const institute = await Admin.getInstituteById(institute_id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    await Admin.rejectInstitute(institute_id);

    let onchain = { success: false, error: null };
    try {
      if (institute.wallet_address) {
        const tx = await blockchain.removeIssuer(institute.wallet_address);
        onchain = { success: true, txHash: tx.txHash, blockNumber: tx.blockNumber };
      } else {
        onchain = { success: false, error: 'No wallet on file' };
      }
    } catch (err) {
      console.error('On-chain removeIssuer failed:', err.message);
      onchain = { success: false, error: err.message };
    }

    res.json({
      message: 'Institute revoked successfully',
      institute_id,
      wallet_address: institute.wallet_address,
      onchain
    });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Admin.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get on-chain issuer status for an institute
exports.getIssuerStatus = async (req, res) => {
  try {
    const { institute_id } = req.params;
    if (!institute_id) {
      return res.status(400).json({ error: 'Institute ID required' });
    }

    const institute = await Admin.getInstituteById(institute_id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }
    if (!institute.wallet_address) {
      return res.status(400).json({ error: 'Institute has no wallet_address on file' });
    }

    const isIssuer = await blockchain.isIssuer(institute.wallet_address);
    res.json({
      institute_id,
      wallet_address: institute.wallet_address,
      isIssuer
    });
  } catch (error) {
    console.error('Issuer status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get blockchain status
exports.getBlockchainStatus = async (req, res) => {
  try {
    const networkInfo = await blockchain.getNetworkInfo();
    res.json({
      status: 'connected',
      blockchain: networkInfo
    });
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({ error: error.message });
  }
};
