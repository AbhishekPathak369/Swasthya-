// backend/models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    symptoms: {
      type: [String],
      required: true,
    },
    disease: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    top_features: {
      type: [String],
      default: [],
    },
    shap_values: {
      type: Map,
      of: Number,
      default: {},
    },
    latency_ms: {
      type: Number,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Prediction', predictionSchema);