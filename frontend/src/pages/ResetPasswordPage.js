import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../Components/common/Button';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation du mot de passe
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // À remplacer par votre appel API
      // await authService.resetPassword(token, formData.password);
      
      setSuccess(true);
      
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError("Une erreur est survenue lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h2>Mot de passe réinitialisé !</h2>
            <p>
              Votre mot de passe a été modifié avec succès. Vous allez être
              redirigé vers la page de connexion dans quelques secondes.
            </p>
            <div className="action-links">
              <Link to="/login" className="login-link">
                Aller à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <div className="reset-password-header">
          <h1>Réinitialiser le mot de passe</h1>
          <p>Veuillez entrer votre nouveau mot de passe ci-dessous.</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${error && error.includes('mot de passe') ? 'error' : ''}`}
              placeholder="Votre nouveau mot de passe"
              disabled={isLoading}
            />
            <span className="password-requirements">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule,
              une minuscule et un chiffre.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${error && error.includes('correspondent') ? 'error' : ''}`}
              placeholder="Confirmez votre mot de passe"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <Button 
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Réinitialiser le mot de passe
          </Button>

          <div className="form-footer">
            <Link to="/login" className="back-to-login">
              <i className="fas fa-arrow-left"></i> Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;