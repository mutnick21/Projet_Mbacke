const { Examen } = require('../models');
const { Question } = require('../models');
const { Groupe } = require('../models');
const { Copie } = require('../models');
const { ResultatExamen } = require('../models');

// Créer un examen
exports.createExamen = async (req, res, next) => {
  try {
    const examen = await Examen.create({
      ...req.body,
      idenseignant: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        examen
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir tous les examens
exports.getAllExamens = async (req, res, next) => {
  try {
    const examens = await Examen.find()
      .populate('idenseignant', 'nom prenom')
      .populate('matiere', 'nom')
      .populate('groupes', 'nomgroupe');

    res.status(200).json({
      status: 'success',
      results: examens.length,
      data: {
        examens
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir un examen spécifique
exports.getExamen = async (req, res, next) => {
  try {
    const examen = await Examen.findById(req.params.id)
      .populate('idenseignant', 'nom prenom')
      .populate('matiere', 'nom')
      .populate('groupes', 'nomgroupe')
      .populate('questions');

    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        examen
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un examen
exports.updateExamen = async (req, res, next) => {
  try {
    const examen = await Examen.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        examen
      }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un examen
exports.deleteExamen = async (req, res, next) => {
  try {
    const examen = await Examen.findByIdAndDelete(req.params.id);

    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    // Supprimer les questions associées
    await Question.deleteMany({ idexamen: req.params.id });

    // Supprimer les copies associées
    await Copie.deleteMany({ idexamen: req.params.id });

    // Supprimer les résultats associés
    await ResultatExamen.deleteMany({ idexamen: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Ajouter des questions à un examen
exports.addQuestions = async (req, res, next) => {
  try {
    const examen = await Examen.findById(req.params.id);

    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    const questions = await Question.create(
      req.body.questions.map(question => ({
        ...question,
        idexamen: req.params.id,
        idenseignant: req.user._id
      }))
    );

    examen.questions.push(...questions.map(q => q._id));
    await examen.save();

    res.status(200).json({
      status: 'success',
      data: {
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les examens d'un enseignant
exports.getExamensEnseignant = async (req, res, next) => {
  try {
    const examens = await Examen.find({ idenseignant: req.user._id })
      .populate('matiere', 'nom')
      .populate('groupes', 'nomgroupe');

    res.status(200).json({
      status: 'success',
      results: examens.length,
      data: {
        examens
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les examens d'un étudiant
exports.getExamensEtudiant = async (req, res, next) => {
  try {
    const examens = await Examen.find({
      groupes: { $in: req.user.groupes }
    })
      .populate('matiere', 'nom')
      .populate('idenseignant', 'nom prenom');

    res.status(200).json({
      status: 'success',
      results: examens.length,
      data: {
        examens
      }
    });
  } catch (error) {
    next(error);
  }
}; 