import React from 'react';

const TexteDisplay = ({ question, response, onChange }) => {
  const handleTextChange = (e) => {
    onChange({ ...response, reponse: e.target.value });
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount(response.reponse);

  return (
    <div className="texte-display">
      <div className="constraints">
        <h4>Contraintes de réponse :</h4>
        <ul>
          <li>Format attendu : {question.reponseType}</li>
          {question.nombreMotsMin && (
            <li>Nombre minimum de mots : {question.nombreMotsMin}</li>
          )}
          {question.nombreMotsMax && (
            <li>Nombre maximum de mots : {question.nombreMotsMax}</li>
          )}
        </ul>
      </div>

      <div className="textarea-container">
        <textarea
          value={response.reponse}
          onChange={handleTextChange}
          placeholder="Écrivez votre réponse ici..."
          required
        />
      </div>

      <div className="word-count">
        Nombre de mots : {wordCount}
        {question.nombreMotsMin && wordCount < question.nombreMotsMin && (
          <span className="error-message">
            Minimum requis : {question.nombreMotsMin} mots
          </span>
        )}
        {question.nombreMotsMax && wordCount > question.nombreMotsMax && (
          <span className="error-message">
            Maximum autorisé : {question.nombreMotsMax} mots
          </span>
        )}
      </div>

      {question.pointsCles && (
        <div className="points-cles">
          <h4>Points clés à aborder :</h4>
          <ul>
            {question.pointsCles.split('\n').map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {!response.reponse.trim() && (
        <div className="error-message">
          Veuillez écrire votre réponse
        </div>
      )}
    </div>
  );
};

export default TexteDisplay; 