const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Groupe = require('../models/Groupe');
const User = require('../models/User');

// @route   POST /api/groupes
// @desc    Créer un nouveau groupe
// @access  Private (Enseignant uniquement)
router.post('/', protect, authorize('enseignant'), async (req, res) => {
  try {
    const { nomgroupe, description } = req.body;

    const groupe = new Groupe({
      nomgroupe,
      description,
      idenseignant: req.user._id,
      etudiants: []
    });

    await groupe.save();

    res.status(201).json({
      success: true,
      groupe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du groupe',
      error: error.message
    });
  }
});

// @route   GET /api/groupes
// @desc    Obtenir tous les groupes (filtré selon le rôle)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let groupes;
    
    if (req.user.role === 'enseignant') {
      groupes = await Groupe.find({ idenseignant: req.user._id })
        .populate('etudiants', 'nom prenom email')
        .populate('idenseignant', 'nom prenom');
    } else {
      groupes = await Groupe.find({ etudiants: req.user._id })
        .populate('idenseignant', 'nom prenom');
    }

    res.json({
      success: true,
      count: groupes.length,
      groupes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des groupes',
      error: error.message
    });
  }
});

// @route   GET /api/groupes/:id
// @desc    Obtenir un groupe spécifique
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const groupe = await Groupe.findById(req.params.id)
      .populate('etudiants', 'nom prenom email')
      .populate('idenseignant', 'nom prenom');

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier l'accès
    const canAccess = 
      req.user.role === 'enseignant' && groupe.idenseignant.equals(req.user._id) ||
      groupe.etudiants.some(etudiant => etudiant._id.equals(req.user._id));

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce groupe'
      });
    }

    res.json({
      success: true,
      groupe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du groupe',
      error: error.message
    });
  }
});

// @route   PUT /api/groupes/:id
// @desc    Modifier un groupe
// @access  Private (Enseignant uniquement)
router.put('/:id', protect, authorize('enseignant'), async (req, res) => {
  try {
    let groupe = await Groupe.findById(req.params.id);

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur du groupe
    if (!groupe.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce groupe'
      });
    }

    groupe = await Groupe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('etudiants', 'nom prenom email');

    res.json({
      success: true,
      groupe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du groupe',
      error: error.message
    });
  }
});

// @route   DELETE /api/groupes/:id
// @desc    Supprimer un groupe
// @access  Private (Enseignant uniquement)
router.delete('/:id', protect, authorize('enseignant'), async (req, res) => {
  try {
    const groupe = await Groupe.findById(req.params.id);

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur du groupe
    if (!groupe.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce groupe'
      });
    }

    // Retirer le groupe des étudiants
    await User.updateMany(
      { _id: { $in: groupe.etudiants } },
      { $pull: { groupes: groupe._id } }
    );

    await groupe.remove();

    res.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du groupe',
      error: error.message
    });
  }
});

// @route   POST /api/groupes/:id/etudiants
// @desc    Ajouter des étudiants au groupe
// @access  Private (Enseignant uniquement)
router.post('/:id/etudiants', protect, authorize('enseignant'), async (req, res) => {
  try {
    const groupe = await Groupe.findById(req.params.id);

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur du groupe
    if (!groupe.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce groupe'
      });
    }

    const { etudiants } = req.body; // Array of student IDs

    // Vérifier que tous les IDs correspondent à des étudiants
    const etudiantsExistants = await User.find({
      _id: { $in: etudiants },
      role: 'etudiant'
    });

    if (etudiantsExistants.length !== etudiants.length) {
      return res.status(400).json({
        success: false,
        message: 'Certains IDs d\'étudiants sont invalides'
      });
    }

    // Ajouter les étudiants au groupe
    groupe.etudiants.push(...etudiants);
    await groupe.save();

    // Ajouter le groupe aux étudiants
    await User.updateMany(
      { _id: { $in: etudiants } },
      { $addToSet: { groupes: groupe._id } }
    );

    const groupeMisAJour = await Groupe.findById(groupe._id)
      .populate('etudiants', 'nom prenom email');

    res.json({
      success: true,
      groupe: groupeMisAJour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout des étudiants',
      error: error.message
    });
  }
});

// @route   DELETE /api/groupes/:id/etudiants/:etudiantId
// @desc    Retirer un étudiant du groupe
// @access  Private (Enseignant uniquement)
router.delete('/:id/etudiants/:etudiantId', protect, authorize('enseignant'), async (req, res) => {
  try {
    const groupe = await Groupe.findById(req.params.id);

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier que l'enseignant est le créateur du groupe
    if (!groupe.idenseignant.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce groupe'
      });
    }

    // Retirer l'étudiant du groupe
    groupe.etudiants = groupe.etudiants.filter(
      etudiant => !etudiant.equals(req.params.etudiantId)
    );
    await groupe.save();

    // Retirer le groupe de l'étudiant
    await User.findByIdAndUpdate(
      req.params.etudiantId,
      { $pull: { groupes: groupe._id } }
    );

    const groupeMisAJour = await Groupe.findById(groupe._id)
      .populate('etudiants', 'nom prenom email');

    res.json({
      success: true,
      groupe: groupeMisAJour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait de l\'étudiant',
      error: error.message
    });
  }
});

module.exports = router; 