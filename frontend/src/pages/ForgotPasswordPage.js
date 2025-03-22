import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Components/common/Button';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format d'email invalide");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // À remplacer par votre appel API
      // await authService.forgotPassword(email);
      
      setSuccess(true);
    } catch (error) {
      setError(
        "Une erreur est survenue lors de l'envoi de l'email. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h2>Email envoyé !</h2>
            <p>
              Si un compte existe avec l'adresse {email}, vous recevrez un email
              avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <div className="action-links">
              <Link to="/login" className="back-to-login">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="forgot-password-header">
          <h1>Mot de passe oublié ?</h1>
          <p>
            Entrez votre adresse email ci-dessous et nous vous enverrons les
            instructions pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-control ${error ? 'error' : ''}`}
              placeholder="votre@email.com"
              disabled={isLoading}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Envoyer les instructions
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

export default ForgotPasswordPage;