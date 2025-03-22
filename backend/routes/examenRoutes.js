const express = require('express');
const router = express.Router();
const examenController = require('../controllers/examenController');
const authController = require('../controllers/authController');

// Protection des routes
router.use(authController.protect);

// Routes pour les enseignants
router.post('/', 
  authController.restrictTo('enseignant'), 
  examenController.createExamen
);

router.get('/', 
  authController.restrictTo('enseignant'), 
  examenController.getExamensEnseignant
);

router.get('/:id', examenController.getExamen);

router.patch('/:id', 
  authController.restrictTo('enseignant'), 
  examenController.updateExamen
);

router.delete('/:id', 
  authController.restrictTo('enseignant'), 
  examenController.deleteExamen
);

// Routes pour les questions
router.post('/:id/questions', 
  authController.restrictTo('enseignant'), 
  examenController.addQuestions
);

// Routes pour les étudiants
router.get('/etudiant/examens', 
  authController.restrictTo('etudiant'), 
  examenController.getExamensEtudiant
);

module.exports = router; 