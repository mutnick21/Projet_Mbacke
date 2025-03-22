const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authController = require('../controllers/authController');

// Protection des routes
router.use(authController.protect);

// Routes pour les enseignants
router.post('/', 
  authController.restrictTo('enseignant'), 
  questionController.createQuestion
);

router.get('/:id', questionController.getQuestion);

router.patch('/:id', 
  authController.restrictTo('enseignant'), 
  questionController.updateQuestion
);

router.delete('/:id', 
  authController.restrictTo('enseignant'), 
  questionController.deleteQuestion
);

// Routes pour les questions d'un examen
router.get('/examen/:examenId', questionController.getQuestionsExamen);

// Route pour noter une question
router.patch('/:id/noter', 
  authController.restrictTo('enseignant'), 
  questionController.noterQuestion
);

// Routes pour les étudiants
router.get('/etudiant/questions', 
  authController.restrictTo('etudiant'), 
  questionController.getQuestionsEtudiant
);

module.exports = router; 