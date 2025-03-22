import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import ExamSubmission from './Components/Etudiant/ExamSubmission'; 
import ExamCreation from './Components/Enseignant/ExamCreation';
import TeacherDashboard from './pages/TeacherDashboard';
import NotificationCenter from './Components/common/NotificationCenter';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour rediriger les utilisateurs déjà connectés
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user.role === 'etudiant') {
      return <Navigate to="/etudiant/dashboard" replace />;
    } else if (user.role === 'enseignant') {
      return <Navigate to="/enseignant/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <NotificationCenter />
      <Routes>
        {/* Routes publiques */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Routes étudiants */}
        <Route 
          path="/etudiant/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["etudiant", "ALL"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/etudiant/submit-exam/:examId" 
          element={
            <ProtectedRoute allowedRoles={["etudiant", "ALL"]}>
              <ExamSubmission />
            </ProtectedRoute>
          } 
        />
        
        {/* Routes enseignants */}
        <Route 
          path="/enseignant/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["enseignant", "ALL"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/enseignant/upload-exam" 
          element={
            <ProtectedRoute allowedRoles={["enseignant", "ALL"]}>
              <ExamCreation />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirection de la page d'accueil basée sur le rôle */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute >
              {user?.role === 'enseignant' ? (
                <Navigate to="/enseignant/dashboard" replace />
              ) : (
                <Navigate to="/etudiant/dashboard" replace />
              )}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;