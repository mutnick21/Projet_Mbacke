const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authController = require('../controllers/authController');

// Protéger toutes les routes
router.use(authController.protect);

// Routes pour les enseignants
router
  .route('/')
  .post(authController.restrictTo('enseignant'), questionController.createQuestion);

router
  .route('/:id')
  .get(questionController.getQuestion)
  .patch(authController.restrictTo('enseignant'), questionController.updateQuestion)
  .delete(authController.restrictTo('enseignant'), questionController.deleteQuestion);

// Routes spécifiques
router.get('/examen/:examenId', questionController.getQuestionsExamen);
router.patch('/:id/noter', authController.restrictTo('enseignant'), questionController.noterQuestion);

module.exports = router; 