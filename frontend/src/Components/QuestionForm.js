import React, { useState } from 'react';
import QCMForm from './questions/QCMForm';
import TexteForm from './questions/TexteForm';
import NumeriqueForm from './questions/NumeriqueForm';
import CodeForm from './questions/CodeForm';
import FichierForm from './questions/FichierForm';
import './QuestionForm.css';

const QuestionForm = ({ onSubmit, initialData = null }) => {
  const [questionData, setQuestionData] = useState(initialData || {
    enonce: '',
    type: 'qcm',
    points: 1,
    options: [''],
    reponseCorrecte: '',
    reponseType: 'texte',
    formatAttendu: '',
    tailleMaxFichier: 5,
    typesFichiersAcceptes: ['pdf', 'doc', 'docx'],
    difficulte: 'moyen',
    temps_estime: 5,
    mots_cles: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(questionData);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionData(prev => ({
      ...prev,
      type: newType,
      // Réinitialiser les champs spécifiques au type
      options: newType === 'qcm' ? [''] : [],
      reponseCorrecte: '',
      reponseType: 'texte',
      formatAttendu: '',
      tailleMaxFichier: 5,
      typesFichiersAcceptes: ['pdf', 'doc', 'docx']
    }));
  };

  const renderQuestionTypeForm = () => {
    switch (questionData.type) {
      case 'qcm':
        return <QCMForm data={questionData} onChange={setQuestionData} />;
      case 'texte':
        return <TexteForm data={questionData} onChange={setQuestionData} />;
      case 'numerique':
        return <NumeriqueForm data={questionData} onChange={setQuestionData} />;
      case 'code':
        return <CodeForm data={questionData} onChange={setQuestionData} />;
      case 'fichier':
        return <FichierForm data={questionData} onChange={setQuestionData} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label htmlFor="enonce">Énoncé de la question</label>
        <textarea
          id="enonce"
          value={questionData.enonce}
          onChange={(e) => setQuestionData(prev => ({ ...prev, enonce: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="type">Type de question</label>
        <select
          id="type"
          value={questionData.type}
          onChange={handleTypeChange}
          required
        >
          <option value="qcm">Question à choix multiples</option>
          <option value="texte">Question ouverte (texte)</option>
          <option value="numerique">Question numérique</option>
          <option value="code">Question de programmation</option>
          <option value="fichier">Question avec fichier</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="points">Points</label>
        <input
          type="number"
          id="points"
          min="1"
          value={questionData.points}
          onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="difficulte">Difficulté</label>
        <select
          id="difficulte"
          value={questionData.difficulte}
          onChange={(e) => setQuestionData(prev => ({ ...prev, difficulte: e.target.value }))}
          required
        >
          <option value="facile">Facile</option>
          <option value="moyen">Moyen</option>
          <option value="difficile">Difficile</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="temps_estime">Temps estimé (minutes)</label>
        <input
          type="number"
          id="temps_estime"
          min="1"
          value={questionData.temps_estime}
          onChange={(e) => setQuestionData(prev => ({ ...prev, temps_estime: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="mots_cles">Mots-clés (séparés par des virgules)</label>
        <input
          type="text"
          id="mots_cles"
          value={questionData.mots_cles.join(', ')}
          onChange={(e) => setQuestionData(prev => ({
            ...prev,
            mots_cles: e.target.value.split(',').map(mot => mot.trim()).filter(mot => mot)
          }))}
        />
      </div>

      {renderQuestionTypeForm()}

      <button type="submit" className="submit-button">
        {initialData ? 'Modifier la question' : 'Créer la question'}
      </button>
    </form>
  );
};

export default QuestionForm; 