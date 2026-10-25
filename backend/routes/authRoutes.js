
const express = require('express');

const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', protect, getMe);

// Temporary endpoints to test authorization
router.get(
  '/patient-test',
  protect,
  authorize('patient'),
  (req, res) => {
    res.json({
      message: 'Welcome Patient!'
    });
  }
);

router.get(
  '/doctor-test',
  protect,
  authorize('doctor'),
  (req, res) => {
    res.json({
      message: 'Welcome Doctor!'
    });
  }
);

module.exports = router;
