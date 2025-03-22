const express = require('express');
const router = express.Router();
const reponseController = require('../controllers/reponseController');
const authController = require('../controllers/authController');

// Protéger toutes les routes
router.use(authController.protect);

// Routes pour les étudiants
router.post('/', reponseController.createReponse);
router.get('/examen/:examenId', reponseController.getReponsesEtudiant);
router.get('/:id', reponseController.getReponse);
router.patch('/:id', reponseController.updateReponse);
router.delete('/:id', reponseController.deleteReponse);

// Routes pour les enseignants
router.get('/question/:questionId', 
  authController.restrictTo('enseignant'),
  reponseController.getReponsesQuestion
);

module.exports = router; 