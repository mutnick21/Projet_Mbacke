const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // En développement, on envoie plus de détails
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
    return;
  }

  // En production, on envoie moins de détails pour la sécurité
  if (err.isOperational) {
    // Erreurs opérationnelles, erreurs que nous avons créées nous-mêmes
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Erreurs de programmation ou autres erreurs inconnues
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue sur le serveur'
    });
  }
};

module.exports = errorHandler; 