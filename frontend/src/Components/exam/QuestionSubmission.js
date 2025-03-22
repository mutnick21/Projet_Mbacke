import React, { useState } from 'react';
import { responseAPI, correctionAIAPI } from '../../mock';
import './QuestionSubmission.css';

const QuestionSubmission = ({ question, examenId, etudiantId }) => {
  const [reponse, setReponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [correction, setCorrection] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Soumettre la réponse
      const response = await responseAPI.submitResponse({
        questionId: question.id,
        examenId,
        etudiantId,
        reponse
      });

      // Obtenir la correction AI
      const correctionResult = await correctionAIAPI.correctResponse(response.id, question.id);
      setCorrection(correctionResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'qcm':
        return (
          <div className="options-list">
            {question.options.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name="reponse"
                  value={option}
                  onChange={(e) => setReponse(e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'texte':
        return (
          <textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            placeholder="Votre réponse..."
            rows={5}
            required
          />
        );

      case 'numerique':
        return (
          <input
            type="number"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            step="any"
            required
          />
        );

      case 'code':
        return (
          <textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            placeholder="Votre code..."
            rows={10}
            className="code-editor"
            required
          />
        );

      case 'fichier':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > question.tailleMaxFichier) {
                  setError(`Le fichier est trop volumineux. Taille maximum : ${question.tailleMaxFichier / 1024 / 1024}MB`);
                  return;
                }
                const extension = file.name.split('.').pop().toLowerCase();
                if (!question.typesFichiersAcceptes.includes(extension)) {
                  setError(`Type de fichier non accepté. Types acceptés : ${question.typesFichiersAcceptes.join(', ')}`);
                  return;
                }
                setReponse(file.name);
              }
            }}
            accept={question.typesFichiersAcceptes.map(type => `.${type}`).join(',')}
            required
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-submission">
      <h3>{question.enonce}</h3>
      <p className="points">Points : {question.points}</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {renderInput()}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Soumission...' : 'Soumettre'}
        </button>
      </form>

      {correction && (
        <div className="correction-result">
          <h4>Correction</h4>
          <p className="note">Note : {correction.note}/{question.points}</p>
          <p className="correction-text">{correction.correction}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionSubmission; 