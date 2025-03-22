import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    completedExams: 0,
    averageScore: 0,
    pendingExams: 0
  });

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, []);

  const fetchExams = async () => {
    try {
      // TODO: Remplacer par l'appel API réel
      const mockExams = [
        {
          id: 1,
          title: "Examen de Programmation",
          date: "2024-03-20",
          duration: "2h",
          status: "pending",
          totalPoints: 100
        },
        {
          id: 2,
          title: "Examen de Mathématiques",
          date: "2024-03-15",
          duration: "3h",
          status: "completed",
          score: 85,
          totalPoints: 100
        },
        {
          id: 3,
          title: "Examen de Physique",
          date: "2024-03-25",
          duration: "2h30",
          status: "in-progress",
          totalPoints: 100
        }
      ];
      setExams(mockExams);
    } catch (err) {
      setError("Erreur lors du chargement des examens");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // TODO: Remplacer par l'appel API réel
      const mockStats = {
        completedExams: 5,
        averageScore: 82.5,
        pendingExams: 3
      };
      setStats(mockStats);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return '';
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResults = (examId) => {
    navigate(`/exam/${examId}/results`);
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Mon Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">Examens Terminés</div>
          <div className="stat-value">{stats.completedExams}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Moyenne Générale</div>
          <div className="stat-value">{stats.averageScore}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Examens en Attente</div>
          <div className="stat-value">{stats.pendingExams}</div>
        </div>
      </div>

      <div className="exam-section">
        <h2 className="section-title">Mes Examens</h2>
        <div className="exam-grid">
          {exams.map(exam => (
            <div key={exam.id} className="exam-card">
              <h3 className="exam-title">{exam.title}</h3>
              <div className="exam-date">
                Date: {new Date(exam.date).toLocaleDateString()}
              </div>
              <div className={`exam-status ${getStatusClass(exam.status)}`}>
                {exam.status === 'pending' && 'En attente'}
                {exam.status === 'completed' && 'Terminé'}
                {exam.status === 'in-progress' && 'En cours'}
              </div>
              <div className="exam-actions">
                {exam.status === 'pending' && (
                  <button 
                    className="action-button start-exam"
                    onClick={() => handleStartExam(exam.id)}
                  >
                    Commencer
                  </button>
                )}
                {exam.status === 'completed' && (
                  <button 
                    className="action-button view-results"
                    onClick={() => handleViewResults(exam.id)}
                  >
                    Voir les résultats
                  </button>
                )}
                {exam.status === 'in-progress' && (
                  <button 
                    className="action-button start-exam"
                    onClick={() => handleStartExam(exam.id)}
                  >
                    Continuer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 