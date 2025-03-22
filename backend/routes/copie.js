const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Copie = require('../models/Copie');
const Examen = require('../models/Examen');

// @route   GET /api/copies
// @desc    Obtenir toutes les copies (filtré selon le rôle)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let copies;
    
    if (req.user.role === 'enseignant') {
      // Les enseignants voient les copies des examens qu'ils ont créés
      const examens = await Examen.find({ idenseignant: req.user._id }).select('_id');
      copies = await Copie.find({ idexamen: { $in: examens } })
        .populate('idetudiant', 'nom prenom')
        .populate('idexamen', 'nomexamen dateexamen')
        .sort('-datedepot');
    } else {
      // Les étudiants ne voient que leurs propres copies
      copies = await Copie.find({ idetudiant: req.user._id })
        .populate('idexamen', 'nomexamen dateexamen')
        .sort('-datedepot');
    }

    res.json({
      success: true,
      count: copies.length,
      copies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des copies',
      error: error.message
    });
  }
});

// @route   GET /api/copies/:id
// @desc    Obtenir une copie spécifique
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const copie = await Copie.findById(req.params.id)
      .populate('idetudiant', 'nom prenom')
      .populate('idexamen', 'nomexamen dateexamen datelimite')
      .populate('reponses.idquestion', 'enonce bareme');

    if (!copie) {
      return res.status(404).json({
        success: false,
        message: 'Copie non trouvée'
      });
    }

    // Vérifier l'accès
    const canAccess = 
      req.user.role === 'enseignant' && copie.idexamen.idenseignant.equals(req.user._id) ||
      copie.idetudiant.equals(req.user._id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette copie'
      });
    }

    res.json({
      success: true,
      copie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la copie',
      error: error.message
    });
  }
});

// @route   PUT /api/copies/:id/note
// @desc    Noter une copie
// @access  Private (Enseignant uniquement)
router.put('/:id/note', protect, authorize('enseignant'), async (req, res) => {
  try {
    const copie = await Copie.findById(req.params.id)
      .populate('idexamen');

    if (!copie) {
      return res.status(404).json({
        success: false,
        message: 'Copie non trouvée'
      });
    }

    // Vérifier que l'enseignant est le créateur de l'examen
    if (!copie.idexamen.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à noter cette copie'
      });
    }

    // Mettre à jour les notes des réponses
    const { notes } = req.body;
    let noteTotal = 0;

    copie.reponses = copie.reponses.map(reponse => {
      const noteQuestion = notes.find(n => n.idquestion.toString() === reponse.idquestion.toString());
      if (noteQuestion) {
        reponse.note = noteQuestion.note;
        reponse.commentaire = noteQuestion.commentaire;
        noteTotal += noteQuestion.note;
      }
      return reponse;
    });

    copie.note = noteTotal;
    copie.estNote = true;
    copie.datenotation = Date.now();
    await copie.save();

    res.json({
      success: true,
      copie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la notation de la copie',
      error: error.message
    });
  }
});

// @route   GET /api/copies/examen/:idexamen
// @desc    Obtenir toutes les copies d'un examen
// @access  Private (Enseignant uniquement)
router.get('/examen/:idexamen', protect, authorize('enseignant'), async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.idexamen);
    
    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur de l'examen
    if (!examen.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir les copies de cet examen'
      });
    }

    const copies = await Copie.find({ idexamen: examen._id })
      .populate('idetudiant', 'nom prenom')
      .sort('-datedepot');

    res.json({
      success: true,
      count: copies.length,
      copies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des copies',
      error: error.message
    });
  }
});

// @route   GET /api/copies/statistiques/:idexamen
// @desc    Obtenir les statistiques des copies d'un examen
// @access  Private (Enseignant uniquement)
router.get('/statistiques/:idexamen', protect, authorize('enseignant'), async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.idexamen);
    
    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur de l'examen
    if (!examen.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir les statistiques de cet examen'
      });
    }

    const copies = await Copie.find({ 
      idexamen: examen._id,
      estNote: true 
    });

    // Calculer les statistiques
    const notes = copies.map(c => c.note);
    const stats = {
      nombreCopies: copies.length,
      moyenne: notes.reduce((a, b) => a + b, 0) / notes.length || 0,
      noteMin: Math.min(...notes, 0),
      noteMax: Math.max(...notes, 0),
      nombreNonNote: await Copie.countDocuments({ 
        idexamen: examen._id,
        estNote: false 
      })
    };

    res.json({
      success: true,
      statistiques: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      error: error.message
    });
  }
});

module.exports = router; 