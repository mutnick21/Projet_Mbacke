const express = require('express');
const router = express.Router();
const resultatExamenController = require('../controllers/resultatExamenController');
const authController = require('../controllers/authController');

// Protéger toutes les routes
router.use(authController.protect);

// Routes pour les étudiants
router.get('/examen/:examenId/calculer', resultatExamenController.calculerResultat);
router.get('/mes-resultats', resultatExamenController.getResultatsEtudiant);
router.get('/:id', resultatExamenController.getResultat);

// Routes pour les enseignants
router.get('/examen/:examenId', 
  authController.restrictTo('enseignant'),
  resultatExamenController.getResultatsExamen
);

module.exports = router; 