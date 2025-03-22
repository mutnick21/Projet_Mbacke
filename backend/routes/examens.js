const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Examen = require('../models/Examen');
const User = require('../models/User');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/examens';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
});

// @route   GET /api/examens
// @desc    Obtenir tous les examens (pour les étudiants)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const examens = await Examen.find({
      status: 'actif',
      dateLimit: { $gt: new Date() }
    }).populate('enseignant', 'nom prenom');

    res.json(examens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des examens' });
  }
});

// @route   GET /api/examens/enseignant
// @desc    Obtenir les examens d'un enseignant
// @access  Private
router.get('/enseignant', auth, async (req, res) => {
  try {
    const examens = await Examen.find({ enseignant: req.user.userId })
      .populate('enseignant', 'nom prenom');

    res.json(examens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des examens' });
  }
});

// @route   POST /api/examens
// @desc    Créer un nouvel examen
// @access  Private (Enseignants uniquement)
router.post('/', auth, upload.single('fichier'), async (req, res) => {
  try {
    const enseignant = await User.findById(req.user.userId);
    if (enseignant.role !== 'enseignant') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const examen = new Examen({
      titre: req.body.titre,
      description: req.body.description,
      matiere: req.body.matiere,
      dateLimit: req.body.dateLimit,
      fichier: req.file.path,
      enseignant: req.user.userId
    });

    await examen.save();

    res.status(201).json(examen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'examen' });
  }
});

// @route   GET /api/examens/:id
// @desc    Obtenir un examen spécifique
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.id)
      .populate('enseignant', 'nom prenom');

    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    res.json(examen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'examen' });
  }
});

// @route   PUT /api/examens/:id
// @desc    Modifier un examen
// @access  Private (Enseignant propriétaire uniquement)
router.put('/:id', auth, upload.single('fichier'), async (req, res) => {
  try {
    let examen = await Examen.findById(req.params.id);
    
    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    if (examen.enseignant.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updateData = {
      titre: req.body.titre,
      description: req.body.description,
      matiere: req.body.matiere,
      dateLimit: req.body.dateLimit,
      status: req.body.status
    };

    if (req.file) {
      // Supprimer l'ancien fichier
      if (fs.existsSync(examen.fichier)) {
        fs.unlinkSync(examen.fichier);
      }
      updateData.fichier = req.file.path;
    }

    examen = await Examen.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(examen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'examen' });
  }
});

// @route   DELETE /api/examens/:id
// @desc    Supprimer un examen
// @access  Private (Enseignant propriétaire uniquement)
router.delete('/:id', auth, async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.id);
    
    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    if (examen.enseignant.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Supprimer le fichier
    if (fs.existsSync(examen.fichier)) {
      fs.unlinkSync(examen.fichier);
    }

    await examen.remove();

    res.json({ message: 'Examen supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'examen' });
  }
});

module.exports = router; 