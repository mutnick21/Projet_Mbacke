import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }

    // Validation confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Appel à l'API d'inscription via le contexte d'authentification
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const user = await register(userData);
      
      // La redirection sera gérée automatiquement par le PublicRoute
      if (user.role === 'enseignant') {
        navigate('/enseignant/dashboard');
      } else {
        navigate('/etudiant/dashboard');
      }
    } catch (error) {
      setErrors({
        submit: error.message || "Erreur lors de l'inscription. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-header">
          <h1>Créer un compte</h1>
          <p>Pour rejoindre la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="role">
              <strong>Je suis un(e)</strong>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="etudiant">Étudiant(e)</option>
              <option value="enseignant">Enseignant(e)</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">
                <strong>Nom</strong>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`form-control ${errors.nom ? 'error' : ''}`}
                placeholder="Votre nom"
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">
                <strong>Prénom</strong>
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`form-control ${errors.prenom ? 'error' : ''}`}
                placeholder="Votre prénom"
              />
              {errors.prenom && <span className="error-message">{errors.prenom}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="votre@email.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <strong>Mot de passe</strong>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Votre mot de passe"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <strong>Confirmer le mot de passe</strong>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <button 
            type="submit"
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Créer mon compte'
            )}
          </button>

          <div className="signup-footer">
            <p>
              Déjà inscrit ?{' '}
              <Link to="/login" className="login-link">
                Connectez-vous
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;