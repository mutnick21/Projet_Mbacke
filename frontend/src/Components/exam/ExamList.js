import React, { useState, useEffect } from 'react';
import { examAPI } from '../../mock';
import './ExamList.css';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await examAPI.getAllExams();
      setExams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement des examens...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="exam-list">
      <h2>Liste des Examens</h2>
      <div className="exam-grid">
        {exams.map(exam => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.titre}</h3>
            <p>{exam.description}</p>
            <div className="exam-details">
              <p>Date de début : {new Date(exam.dateDebut).toLocaleString()}</p>
              <p>Date de fin : {new Date(exam.dateFin).toLocaleString()}</p>
              <p>Durée : {exam.duree} minutes</p>
              <p>Nombre de questions : {exam.questions.length}</p>
            </div>
            <button 
              className="view-exam-btn"
              onClick={() => window.location.href = `/exam/${exam.id}`}
            >
              Voir l'examen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamList; 