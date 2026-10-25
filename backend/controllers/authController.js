
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// REGISTER USER

const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Validate inputs
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof mobile !== 'string' ||
      !/^[6-9]\d{9}$/.test(mobile.trim()) ||
      typeof password !== 'string' ||
      password.length < 12 ||
      Buffer.byteLength(password, 'utf8') > 72 ||
      !['patient', 'doctor'].includes(role)
    ) {
      return res.status(400).json({
        message: 'Please provide valid registration details. Password must contain at least 12 characters.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,

      // Never grant doctor privileges through public signup.
      role: 'patient',

      doctorVerificationStatus:
        role === 'doctor' ? 'pending' : 'not_applicable'
    });

    return res.status(201).json({
      message:
        role === 'doctor'
          ? 'Account created. Doctor verification is pending.'
          : 'Registration successful',

      token: generateToken(user),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
            avatar: user.avatar,
        doctorVerificationStatus: user.doctorVerificationStatus
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    next(error);
  }
};


// LOGIN USER
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user),
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
      avatar: user.avatar,
  role: user.role,
  doctorVerificationStatus: user.doctorVerificationStatus
}
    });

  } catch (error) {
    next(error);
  }
};

// GET CURRENT LOGGED-IN USER
const getMe = async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatar: user.avatar,
      doctorVerificationStatus: user.doctorVerificationStatus
    }
  });
};

module.exports = { register, login, getMe };
