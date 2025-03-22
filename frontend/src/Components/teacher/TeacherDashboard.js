import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    averageCompletion: 0
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
          status: "active",
          totalStudents: 45,
          completedStudents: 32,
          averageScore: 78.5
        },
        {
          id: 2,
          title: "Examen de Mathématiques",
          date: "2024-03-15",
          duration: "3h",
          status: "completed",
          totalStudents: 50,
          completedStudents: 48,
          averageScore: 82.3
        },
        {
          id: 3,
          title: "Examen de Physique",
          date: "2024-03-25",
          duration: "2h30",
          status: "draft",
          totalStudents: 0,
          completedStudents: 0,
          averageScore: 0
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
        totalExams: 12,
        activeExams: 3,
        totalStudents: 150,
        averageCompletion: 85.5
      };
      setStats(mockStats);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
    }
  };

  const handleCreateExam = () => {
    navigate('/teacher/exam/create');
  };

  const handleEditExam = (examId) => {
    navigate(`/teacher/exam/${examId}/edit`);
  };

  const handleViewResults = (examId) => {
    navigate(`/teacher/exam/${examId}/results`);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        // TODO: Remplacer par l'appel API réel
        setExams(exams.filter(exam => exam.id !== examId));
      } catch (err) {
        setError("Erreur lors de la suppression de l'examen");
      }
    }
  };

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Enseignant</h1>
        <button className="create-exam-button" onClick={handleCreateExam}>
          <span>+</span> Créer un examen
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">Total des Examens</div>
          <div className="stat-value">{stats.totalExams}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Examens Actifs</div>
          <div className="stat-value">{stats.activeExams}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total des Étudiants</div>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Taux de Complétion Moyen</div>
          <div className="stat-value">{stats.averageCompletion}%</div>
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
              <div className="exam-stats">
                <div className="stat-item">
                  <div className="stat-label">Étudiants</div>
                  <div className="stat-number">{exam.completedStudents}/{exam.totalStudents}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Moyenne</div>
                  <div className="stat-number">{exam.averageScore}%</div>
                </div>
              </div>
              <div className="exam-actions">
                {exam.status === 'draft' && (
                  <button 
                    className="action-button edit-exam"
                    onClick={() => handleEditExam(exam.id)}
                  >
                    Modifier
                  </button>
                )}
                {exam.status === 'active' && (
                  <button 
                    className="action-button view-results"
                    onClick={() => handleViewResults(exam.id)}
                  >
                    Voir les résultats
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
                <button 
                  className="action-button delete-exam"
                  onClick={() => handleDeleteExam(exam.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 