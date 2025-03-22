const express = require('express');
const router = express.Router();
const copieController = require('../controllers/copieController');
const authController = require('../controllers/authController');

// Routes protégées
router.use(authController.protect);

// Routes pour les étudiants
router
  .route('/')
  .post(authController.restrictTo('etudiant'), copieController.createCopie);

router
  .route('/:id')
  .get(copieController.getCopie)
  .patch(authController.restrictTo('etudiant'), copieController.updateCopie)
  .delete(authController.restrictTo('etudiant'), copieController.deleteCopie);

// Routes pour les copies d'un examen
router.get('/examen/:examenId', copieController.getCopiesExamen);

// Route pour noter une copie
router.patch(
  '/:id/noter',
  authController.restrictTo('enseignant'),
  copieController.noterCopie
);

// Routes pour les étudiants
router.get(
  '/etudiant/copies',
  authController.restrictTo('etudiant'),
  copieController.getCopiesEtudiant
);

module.exports = router; 