
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Bearer token exists
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        message: 'Not authorized. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Invalid authorization header'
      });
    }

    // Verify JWT signature and expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    // Retrieve user from MongoDB
    const user = await User.findById(decoded.id)
      .select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists'
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError' ||
      error.name === 'CastError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    next(error);
  }
};

module.exports = {protect};
