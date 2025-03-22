import React, { useState } from 'react';
import axios from 'axios';
import './CorrectionAI.css';

const CorrectionAI = ({ reponseId, questionId, onCorrectionComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [correction, setCorrection] = useState(null);

  const handleCorrection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:4500/api/correction-ai/reponse/${reponseId}`,
        { questionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setCorrection(response.data.data);
      if (onCorrectionComplete) {
        onCorrectionComplete(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la correction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="correction-ai">
      <button
        className="correction-button"
        onClick={handleCorrection}
        disabled={isLoading}
      >
        {isLoading ? 'Correction en cours...' : 'Corriger avec IA'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {correction && (
        <div className="correction-result">
          <h3>Correction automatique</h3>
          <div className="correction-content">
            <div className="correction-section">
              <h4>Note attribuée</h4>
              <p>{correction.note}</p>
            </div>
            <div className="correction-section">
              <h4>Correction détaillée</h4>
              <p>{correction.correction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionAI; 