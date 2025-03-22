const express = require('express');
const router = express.Router();
const { protect, authorize, checkGroupMembership } = require('../middleware/auth');
const Examen = require('../models/Examen');
const Question = require('../models/Question');
const Copie = require('../models/Copie');
const examenController = require('../controllers/examenController');
const authController = require('../controllers/authController');

// Protéger toutes les routes
router.use(authController.protect);

// Routes pour les enseignants
router
  .route('/')
  .post(authController.restrictTo('enseignant'), examenController.createExamen)
  .get(examenController.getAllExamens);

router
  .route('/:id')
  .get(examenController.getExamen)
  .patch(authController.restrictTo('enseignant'), examenController.updateExamen)
  .delete(authController.restrictTo('enseignant'), examenController.deleteExamen);

// Routes spécifiques
router.get('/enseignant/mes-examens', 
  authController.restrictTo('enseignant'), 
  examenController.getExamensEnseignant
);

router.get('/groupe/:groupeId', examenController.getExamensGroupe);

// @route   POST /api/examens/:id/questions
// @desc    Ajouter une question à un examen
// @access  Private (Enseignant uniquement)
router.post('/:id/questions', protect, authorize('enseignant'), async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.id);

    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    const question = new Question({
      ...req.body,
      idexamen: examen._id,
      idenseignant: req.user._id
    });

    await question.save();
    examen.questions.push(question._id);
    await examen.save();

    res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la question',
      error: error.message
    });
  }
});

// @route   POST /api/examens/:id/copies
// @desc    Soumettre une copie d'examen
// @access  Private (Étudiant uniquement)
router.post('/:id/copies', protect, authorize('etudiant'), async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.id);

    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    // Vérifier si l'étudiant peut soumettre une copie
    const canSubmit = examen.groupes.some(groupe => 
      req.user.groupes.includes(groupe)
    );

    if (!canSubmit) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à soumettre une copie pour cet examen'
      });
    }

    // Vérifier la date limite
    if (new Date() > new Date(examen.datelimite)) {
      return res.status(400).json({
        success: false,
        message: 'La date limite de soumission est dépassée'
      });
    }

    const copie = new Copie({
      ...req.body,
      idetudiant: req.user._id,
      idexamen: examen._id,
      datedepot: Date.now()
    });

    await copie.save();

    res.status(201).json({
      success: true,
      copie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission de la copie',
      error: error.message
    });
  }
});

module.exports = router; 