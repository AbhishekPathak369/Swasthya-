// backend/controllers/predict.controller.js
const Prediction = require('../models/Prediction');
const mlService = require('../services/mlService');

// @desc    Get disease prediction & explanation
// @route   POST /api/predict
// @access  Public (or protected by your auth middleware)
const predictDisease = async (req, res) => {
  try {
    const { symptoms } = req.body;

    // 1. Validation
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide a non-empty array of symptoms.',
      });
    }

    // 2. Call the Python ML Service (Parallel for speed)
    // We run both at the same time using Promise.all.
    // If /explain fails (e.g., SHAP unavailable), we still want /predict to succeed.
    const [predictionData, explanationData] = await Promise.all([
      mlService.getPrediction(symptoms),
      mlService.getExplanation(symptoms).catch((err) => {
        console.warn('⚠️ Explanation failed, continuing without SHAP:', err.message);
        return null; // Fallback if SHAP is down
      }),
    ]);

    // 3. Save to MongoDB (optional history tracking)
    const savedPrediction = await Prediction.create({
      symptoms,
      disease: predictionData.disease,
      confidence: predictionData.confidence,
      top_features: predictionData.top_features,
      shap_values: explanationData?.shap_values || {},
      latency_ms: predictionData.latency_ms,
    });

    // 4. Send the combined response to the React frontend
    res.status(200).json({
      success: true,
      data: {
        prediction: predictionData,
        explanation: explanationData, // Contains shap_values, or null if unavailable
        historyId: savedPrediction._id,
      },
    });
  } catch (error) {
    console.error('❌ Predict Controller Error:', error.message);
    res.status(error.status || 500).json({
      error: 'Prediction Service Error',
      message: error.message,
    });
  }
};

module.exports = {
  predictDisease,
};