import React from 'react';

const NumeriqueDisplay = ({ question, response, onChange }) => {
  const handleNumericChange = (e) => {
    const value = e.target.value;
    onChange({ ...response, reponse: value });
  };

  const handleUnitChange = (e) => {
    onChange({ ...response, unite: e.target.value });
  };

  const isValidNumber = (value) => {
    return !isNaN(value) && value !== '';
  };

  const isWithinTolerance = (value) => {
    if (!isValidNumber(value)) return false;
    const numValue = parseFloat(value);
    const correctAnswer = parseFloat(question.reponse);
    const tolerance = parseFloat(question.tolerance) || 0;
    return Math.abs(numValue - correctAnswer) <= tolerance;
  };

  return (
    <div className="numerique-display">
      <div className="constraints">
        <h4>Contraintes de réponse :</h4>
        <ul>
          <li>Type de réponse : {question.typeReponse}</li>
          {question.tolerance && (
            <li>Tolérance acceptée : ±{question.tolerance}</li>
          )}
          {question.unite && (
            <li>Unité attendue : {question.unite}</li>
          )}
        </ul>
      </div>

      <div className="input-container">
        <div className="numeric-input">
          <input
            type="number"
            value={response.reponse}
            onChange={handleNumericChange}
            placeholder="Entrez votre réponse"
            step={question.typeReponse === 'entier' ? '1' : 'any'}
            required
          />
        </div>

        {question.unite && (
          <div className="unit-input">
            <input
              type="text"
              value={response.unite || ''}
              onChange={handleUnitChange}
              placeholder="Unité"
              required
            />
          </div>
        )}
      </div>

      {isValidNumber(response.reponse) && (
        <div className="validation-message">
          {isWithinTolerance(response.reponse) ? (
            <span className="success-message">
              Votre réponse est dans la marge de tolérance acceptée
            </span>
          ) : (
            <span className="warning-message">
              Votre réponse est en dehors de la marge de tolérance acceptée
            </span>
          )}
        </div>
      )}

      {!isValidNumber(response.reponse) && response.reponse !== '' && (
        <div className="error-message">
          Veuillez entrer un nombre valide
        </div>
      )}

      {question.unite && !response.unite && (
        <div className="error-message">
          Veuillez spécifier l'unité de votre réponse
        </div>
      )}
    </div>
  );
};

export default NumeriqueDisplay; 