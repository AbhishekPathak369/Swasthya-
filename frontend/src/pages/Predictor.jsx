// frontend/src/pages/Predictor.jsx
import React, { useState } from 'react';
import { predictDisease } from '../services/api';
import './Predictor.css';

const Predictor = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle adding a symptom to the list
  const handleAddSymptom = (e) => {
    e.preventDefault();
    const cleanInput = symptomInput.trim().toLowerCase();
    if (cleanInput && !symptoms.includes(cleanInput)) {
      setSymptoms([...symptoms, cleanInput]);
      setSymptomInput('');
    }
  };

  // Handle removing a symptom
  const handleRemoveSymptom = (symToRemove) => {
    setSymptoms(symptoms.filter((s) => s !== symToRemove));
  };

  // Call the backend
  const handlePredict = async () => {
    if (symptoms.length === 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictDisease(symptoms);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h1>Swasthya+ <span>Diagnosis</span></h1>
        <p>Enter your symptoms below to get an AI-powered prediction.</p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <form onSubmit={handleAddSymptom} className="symptom-form">
          <input
            type="text"
            placeholder="e.g., fever, headache, nausea..."
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        <div className="symptom-tags">
          {symptoms.map((sym, idx) => (
            <span key={idx} className="symptom-tag">
              {sym}
              <button onClick={() => handleRemoveSymptom(sym)}>×</button>
            </span>
          ))}
        </div>

        <button 
          className="predict-btn" 
          onClick={handlePredict} 
          disabled={symptoms.length === 0 || loading}
        >
          {loading ? 'Analyzing...' : 'Predict Disease'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Results Section */}
      {result && (
        <div className="results-section">
          <div className="diagnosis-card">
            <h2>Prediction</h2>
            <h3 className="disease-name">{result.prediction.disease}</h3>
            <p className="confidence">
              Confidence: <strong>{(result.prediction.confidence * 100).toFixed(1)}%</strong>
            </p>
            <p className="latency">Inference time: {result.prediction.latency_ms}ms</p>
          </div>

          {/* Explainability Section (SHAP) */}
          {result.explanation && result.explanation.shap_values && (
            <div className="explanation-card">
              <h2>Why this prediction?</h2>
              <p className="explanation-desc">How much each symptom influenced this diagnosis:</p>
              
              <div className="shap-bars">
                {Object.entries(result.explanation.shap_values).map(([symptom, value]) => {
                  // Max absolute value for scaling the bars
                  const maxVal = Math.max(...Object.values(result.explanation.shap_values).map(Math.abs));
                  const widthPercent = (Math.abs(value) / maxVal) * 100;
                  const isPositive = value > 0;

                  return (
                    <div key={symptom} className="shap-row">
                      <span className="shap-symptom">{symptom}</span>
                      <div className="shap-bar-container">
                        <div 
                          className={`shap-bar ${isPositive ? 'positive' : 'negative'}`}
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                      <span className="shap-value">
                        {isPositive ? '+' : ''}{value.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Predictor;