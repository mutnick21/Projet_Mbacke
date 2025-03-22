import React, { useState } from 'react';
import QCMDisplay from './questions/QCMDisplay';
import TexteDisplay from './questions/TexteDisplay';
import NumeriqueDisplay from './questions/NumeriqueDisplay';
import CodeDisplay from './questions/CodeDisplay';
import FichierDisplay from './questions/FichierDisplay';
import './QuestionDisplay.css';

const QuestionDisplay = ({ question, onSubmit }) => {
  const [response, setResponse] = useState({
    reponse: '',
    unite: '',
    fichiers: []
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation de base
    if (!response.reponse && !response.fichiers.length) {
      setError('Veuillez répondre à la question');
      return;
    }

    // Validation spécifique selon le type de question
    switch (question.type) {
      case 'qcm':
        if (!response.reponse) {
          setError('Veuillez sélectionner une réponse');
          return;
        }
        break;
      case 'texte':
        if (!response.reponse.trim()) {
          setError('Veuillez écrire votre réponse');
          return;
        }
        break;
      case 'numerique':
        if (!response.reponse || isNaN(response.reponse)) {
          setError('Veuillez entrer un nombre valide');
          return;
        }
        if (question.unite && !response.unite) {
          setError('Veuillez spécifier l\'unité');
          return;
        }
        break;
      case 'code':
        if (!response.reponse.trim()) {
          setError('Veuillez écrire votre code');
          return;
        }
        break;
      case 'fichier':
        if (response.fichiers.length === 0) {
          setError('Veuillez sélectionner au moins un fichier');
          return;
        }
        break;
      default:
        setError('Type de question non supporté');
        return;
    }

    onSubmit(response);
  };

  const renderQuestionTypeDisplay = () => {
    switch (question.type) {
      case 'qcm':
        return (
          <QCMDisplay
            question={question}
            response={response}
            onChange={setResponse}
          />
        );
      case 'texte':
        return (
          <TexteDisplay
            question={question}
            response={response}
            onChange={setResponse}
          />
        );
      case 'numerique':
        return (
          <NumeriqueDisplay
            question={question}
            response={response}
            onChange={setResponse}
          />
        );
      case 'code':
        return (
          <CodeDisplay
            question={question}
            response={response}
            onChange={setResponse}
          />
        );
      case 'fichier':
        return (
          <FichierDisplay
            question={question}
            response={response}
            onChange={setResponse}
          />
        );
      default:
        return <div>Type de question non supporté</div>;
    }
  };

  return (
    <div className="question-display">
      <div className="question-header">
        <h2>{question.titre}</h2>
        <div className="question-meta">
          <span className="points">{question.points} points</span>
          {question.difficulte && (
            <span className="difficulty">{question.difficulte}</span>
          )}
          {question.tempsLimite && (
            <span className="time-limit">{question.tempsLimite} minutes</span>
          )}
        </div>
      </div>

      <div className="question-content">
        <p>{question.enonce}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {renderQuestionTypeDisplay()}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="submit-container">
          <button type="submit" className="submit-button">
            Soumettre la réponse
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionDisplay; 