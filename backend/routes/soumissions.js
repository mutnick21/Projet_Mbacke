const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Soumission = require('../models/Soumission');
const Examen = require('../models/Examen');
const User = require('../models/User');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/soumissions';
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

// @route   POST /api/soumissions
// @desc    Soumettre un examen
// @access  Private (Étudiants uniquement)
router.post('/', auth, upload.single('fichier'), async (req, res) => {
  try {
    const etudiant = await User.findById(req.user.userId);
    if (etudiant.role !== 'etudiant') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const examen = await Examen.findById(req.body.examenId);
    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    if (examen.status !== 'actif') {
      return res.status(400).json({ message: 'Cet examen n\'est plus disponible' });
    }

    if (new Date(examen.dateLimit) < new Date()) {
      return res.status(400).json({ message: 'La date limite est dépassée' });
    }

    // Vérifier si l'étudiant a déjà soumis
    const existingSoumission = await Soumission.findOne({
      etudiant: req.user.userId,
      examen: req.body.examenId
    });

    if (existingSoumission) {
      return res.status(400).json({ message: 'Vous avez déjà soumis cet examen' });
    }

    const soumission = new Soumission({
      etudiant: req.user.userId,
      examen: req.body.examenId,
      fichier: req.file.path
    });

    await soumission.save();

    res.status(201).json(soumission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la soumission de l\'examen' });
  }
});

// @route   GET /api/soumissions/etudiant
// @desc    Obtenir les soumissions d'un étudiant
// @access  Private
router.get('/etudiant', auth, async (req, res) => {
  try {
    const soumissions = await Soumission.find({ etudiant: req.user.userId })
      .populate('examen')
      .populate('etudiant', 'nom prenom');

    res.json(soumissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
  }
});

// @route   GET /api/soumissions/examen/:examenId
// @desc    Obtenir toutes les soumissions pour un examen
// @access  Private (Enseignant propriétaire uniquement)
router.get('/examen/:examenId', auth, async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.examenId);
    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    if (examen.enseignant.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const soumissions = await Soumission.find({ examen: req.params.examenId })
      .populate('etudiant', 'nom prenom email')
      .populate('examen');

    res.json(soumissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
  }
});

// @route   PUT /api/soumissions/:id/note
// @desc    Noter une soumission
// @access  Private (Enseignant propriétaire de l'examen uniquement)
router.put('/:id/note', auth, async (req, res) => {
  try {
    const soumission = await Soumission.findById(req.params.id)
      .populate('examen');

    if (!soumission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    if (soumission.examen.enseignant.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    soumission.note = req.body.note;
    soumission.commentaire = req.body.commentaire;
    soumission.status = 'corrige';

    await soumission.save();

    res.json(soumission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la notation de la soumission' });
  }
});

module.exports = router; 