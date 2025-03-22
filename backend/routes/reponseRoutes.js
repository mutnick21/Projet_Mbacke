const express = require('express');
const router = express.Router();
const reponseController = require('../controllers/reponseController');
const authController = require('../controllers/authController');

// Protection des routes
router.use(authController.protect);

// Routes pour les étudiants
router.post('/', 
  authController.restrictTo('etudiant'), 
  reponseController.createReponse
);

router.get('/:id', reponseController.getReponse);

router.patch('/:id', 
  authController.restrictTo('etudiant'), 
  reponseController.updateReponse
);

router.delete('/:id', 
  authController.restrictTo('etudiant'), 
  reponseController.deleteReponse
);

// Routes pour les réponses d'une question
router.get('/question/:questionId', reponseController.getReponsesQuestion);

// Route pour noter une réponse
router.patch('/:id/noter', 
  authController.restrictTo('enseignant'), 
  reponseController.noterReponse
);

// Routes pour les étudiants
router.get('/etudiant/reponses', 
  authController.restrictTo('etudiant'), 
  reponseController.getReponsesEtudiant
);

module.exports = router; 