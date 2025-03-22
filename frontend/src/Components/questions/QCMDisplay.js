import React from 'react';

const QCMDisplay = ({ question, response, onChange }) => {
  const handleOptionSelect = (option) => {
    onChange({ ...response, reponse: option });
  };

  return (
    <div className="qcm-display">
      <div className="qcm-options">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`qcm-option ${response.reponse === option ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option)}
          >
            <input
              type="radio"
              name={`qcm-${question._id}`}
              value={option}
              checked={response.reponse === option}
              onChange={() => handleOptionSelect(option)}
              required
            />
            <span>{option}</span>
          </div>
        ))}
      </div>

      {!response.reponse && (
        <div className="error-message">
          Veuillez sélectionner une réponse
        </div>
      )}
    </div>
  );
};

export default QCMDisplay; 