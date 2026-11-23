const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JSON Web Token (JWT)
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'agrohub_development_secret_key_2026',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register a new user (Farmer or Buyer)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Role validation (defaults to 'farmer' if not specified)
    const validRoles = ['farmer', 'buyer'];
    const userRole = role ? role.toLowerCase() : 'farmer';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        status: 'fail',
        message: "Invalid role specified. Permitted roles are 'farmer' or 'buyer'.",
      });
    }

    // 2. Prevent duplicate email registration
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 3. Create user (password is automatically hashed by User model pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      phone: phone ? phone.trim() : '',
      location: location ? location.trim() : '',
    });

    // 4. Return response with JWT token
    return res.status(201).json({
      status: 'success',
      message: `${user.role === 'farmer' ? 'Farmer' : 'Buyer'} account registered successfully.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    console.error('[Auth Controller] Register Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred during registration.',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find user in database
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // 3. Verify password using the User schema matchPassword instance method
    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        status: 'success',
        message: 'Login successful.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }
  } catch (error) {
    console.error('[Auth Controller] Login Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred during login.',
    });
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: req.user,
  });
};

/**
 * @desc    Update logged in user profile (name, phone, location)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found.',
      });
    }

    if (req.body.name && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone.trim();
    }
    if (req.body.location !== undefined) {
      user.location = req.body.location.trim();
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        token: generateToken(updatedUser._id, updatedUser.role),
      },
    });
  } catch (error) {
    console.error('[Auth Controller] Update Profile Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error updating profile.',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
