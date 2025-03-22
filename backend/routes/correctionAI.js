const express = require('express');
const router = express.Router();
const correctionAIController = require('../controllers/correctionAIController');
const authController = require('../controllers/authController');

// Toutes les routes sont protégées
router.use(authController.protect);

// Route pour corriger une réponse individuelle
router.post('/reponse/:reponseId', correctionAIController.corrigerReponse);

// Route pour corriger toutes les réponses d'un examen
router.post('/examen/:examenId', correctionAIController.corrigerExamen);

module.exports = router; 