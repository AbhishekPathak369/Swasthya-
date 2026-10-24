// backend/routes/predict.routes.js
const express = require('express');
const router = express.Router();
const { predictDisease } = require('../controllers/predict.controller');

// POST /api/predict
router.post('/', predictDisease);

module.exports = router;