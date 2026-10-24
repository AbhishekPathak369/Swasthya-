import React, { useState } from 'react';
import { predictDisease } from '../services/api';
import './Predictor.css';

const SYMPTOMS_LIST = [
  "abdominal pain", "abnormal menstruation", "acidity", "acute liver failure", "altered sensorium",
  "anxiety", "back pain", "belly pain", "blackheads", "bladder discomfort", "blister", "blood in sputum",
  "bloody stool", "blurred and distorted vision", "breathlessness", "brittle nails", "bruising",
  "burning micturition", "chest pain", "chills", "cold hands and feets", "coma", "congestion",
  "constipation", "continuous feel of urine", "continuous sneezing", "cough", "cramps", "dark urine",
  "dehydration", "depression", "diarrhoea", "dischromic patches", "distention of abdomen", "dizziness",
  "drying and tingling lips", "enlarged thyroid", "excessive hunger", "extra marital contacts",
  "family history", "fast heart rate", "fatigue", "fever", "fluid overload", "foul smell of urine",
  "headache", "high fever", "hip joint pain", "history of alcohol consumption", "increased appetite",
  "indigestion", "inflammatory nails", "internal itching", "irregular sugar level", "irritability",
  "irritation in anus", "itching", "joint pain", "knee pain", "lack of concentration", "lethargy",
  "loss of appetite", "loss of balance", "loss of smell", "malaise", "mild fever", "mood swings",
  "movement stiffness", "mucoid sputum", "muscle pain", "muscle wasting", "muscle weakness", "nausea",
  "neck pain", "nodal skin eruptions", "obesity", "pain behind the eyes", "pain during bowel movements",
  "pain in anal region", "painful walking", "palpitations", "passage of gases", "patches in throat",
  "phlegm", "polyuria", "prominent veins on calf", "puffy face and eyes", "pus filled pimples",
  "receiving blood transfusion", "receiving unsterile injections", "red sore around nose", "red spots over body",
  "redness of eyes", "restlessness", "runny nose", "rusty sputum", "scurring", "shivering", "silver like dusting",
  "sinus pressure", "skin peeling", "skin rash", "slurred speech", "small dents in nails", "spinning movements",
  "spotting urination", "stiff neck", "stomach bleeding", "stomach pain", "sunken eyes", "sweating",
  "swelled lymph nodes", "swelling joints", "swelling of stomach", "swollen blood vessels", "swollen extremeties",
  "swollen legs", "thirst", "throat irritation", "toxic look (typhos)", "ulcers on tongue", "unsteadiness",
  "visual disturbances", "vomiting", "watering from eyes", "weakness in limbs", "weakness of one body side",
  "weight gain", "weight loss", "yellow crust ooze", "yellow urine", "yellowing of eyes", "yellowish skin"
].sort();

const Predictor = () => {
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAddSymptom = (e) => {
    e.preventDefault();
    if (selectedSymptom && !symptoms.includes(selectedSymptom)) {
      setSymptoms([...symptoms, selectedSymptom]);
      setSelectedSymptom(''); // Reset dropdown to default state
    }
  };

  const handleRemoveSymptom = (symToRemove) => {
    setSymptoms(symptoms.filter((s) => s !== symToRemove));
  };

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
    <div className="predictor-page">
      <div className="predictor-content-wrapper">
        
        {/* Header Section */}
        <div className="predictor-header">
          <div className="header-text">
            <h1>Swasthya+ <span>Diagnosis</span></h1>
            <p>Select your symptoms on the left to generate an AI-powered prediction.</p>
          </div>
          <div className="header-badge">⚡ Powered by Hybrid Deep Learning</div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="predictor-grid">
          
          {/* LEFT COLUMN: Input Form */}
          <div className="predictor-column input-column">
            <div className="card">
              <h2>1. Select Symptoms</h2>
              
              <form onSubmit={handleAddSymptom} className="dropdown-form">
                <select 
                  value={selectedSymptom} 
                  onChange={(e) => setSelectedSymptom(e.target.value)}
                  className="symptom-dropdown"
                >
                  <option value="" disabled>Select a symptom from the list...</option>
                  {SYMPTOMS_LIST.filter(sym => !symptoms.includes(sym)).map((sym) => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
                <button type="submit" className="add-btn" disabled={!selectedSymptom}>
                  + Add
                </button>
              </form>

              <h3 className="selected-title">Selected Symptoms ({symptoms.length})</h3>
              <div className="symptom-tags">
                {symptoms.length === 0 ? (
                  <p className="empty-tags-text">No symptoms selected yet.</p>
                ) : (
                  symptoms.map((sym, idx) => (
                    <span key={idx} className="symptom-tag">
                      {sym}
                      <button type="button" onClick={() => handleRemoveSymptom(sym)}>×</button>
                    </span>
                  ))
                )}
              </div>

              <button 
                className="predict-btn" 
                onClick={handlePredict} 
                disabled={symptoms.length === 0 || loading}
              >
                {loading ? 'Analyzing...' : 'Generate Prediction'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="predictor-column results-column">
            
            {/* Initial empty state */}
            {!result && !loading && !error && (
              <div className="card empty-results-card">
                <div className="empty-icon">🩺</div>
                <h2>Awaiting Symptoms</h2>
                <p>Select symptoms and hit Generate Prediction to see the AI's diagnosis and explainability report.</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="card empty-results-card">
                <div className="loading-spinner"></div>
                <h2>Analyzing Data...</h2>
                <p>The Hybrid Model is processing your input.</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="card error-card">
                <h2>Error</h2>
                <p>{error}</p>
              </div>
            )}

            {/* Result state */}
            {result && (
              <>
                <div className="card diagnosis-card">
                  <div className="card-label">Diagnosis Result</div>
                  <h2 className="disease-name">{result.prediction.disease}</h2>
                  
                  <div className="confidence-wrapper">
                    <div className="confidence-bar-bg">
                      <div 
                        className="confidence-bar-fill" 
                        style={{ width: `${result.prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="confidence-text">{(result.prediction.confidence * 100).toFixed(1)}% Confidence</span>
                  </div>
                  
                  <div className="stats-row">
                    <span>⏱️ {result.prediction.latency_ms}ms Inference</span>
                    <span>🧠 Transformer + BiLSTM</span>
                  </div>
                </div>

                {result.explanation && result.explanation.shap_values && (
                  <div className="card explanation-card">
                    <div className="card-label">Explainable AI (SHAP)</div>
                    <h3>Why this prediction?</h3>
                    
                    <div className="shap-bars">
                      {Object.entries(result.explanation.shap_values).map(([symptom, value]) => {
                        const maxVal = Math.max(...Object.values(result.explanation.shap_values).map(Math.abs), 0.01);
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictor;