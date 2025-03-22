const { Reponse } = require('../models');
const { Question } = require('../models');
const { Copie } = require('../models');

// Créer une réponse
exports.createReponse = async (req, res, next) => {
  try {
    const reponse = await Reponse.create({
      ...req.body,
      idetudiant: req.user._id
    });

    // Mettre à jour la question avec la réponse
    await Question.findByIdAndUpdate(
      req.body.idquestion,
      { $push: { reponses: reponse._id } }
    );

    res.status(201).json({
      status: 'success',
      data: {
        reponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir toutes les réponses d'une question
exports.getReponsesQuestion = async (req, res, next) => {
  try {
    const reponses = await Reponse.find({ idquestion: req.params.questionId })
      .populate('idetudiant', 'nom prenom');

    res.status(200).json({
      status: 'success',
      results: reponses.length,
      data: {
        reponses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir une réponse spécifique
exports.getReponse = async (req, res, next) => {
  try {
    const reponse = await Reponse.findById(req.params.id)
      .populate('idetudiant', 'nom prenom')
      .populate('idquestion', 'commentaire');

    if (!reponse) {
      return res.status(404).json({
        status: 'error',
        message: 'Réponse non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une réponse
exports.updateReponse = async (req, res, next) => {
  try {
    const reponse = await Reponse.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!reponse) {
      return res.status(404).json({
        status: 'error',
        message: 'Réponse non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une réponse
exports.deleteReponse = async (req, res, next) => {
  try {
    const reponse = await Reponse.findByIdAndDelete(req.params.id);

    if (!reponse) {
      return res.status(404).json({
        status: 'error',
        message: 'Réponse non trouvée'
      });
    }

    // Supprimer la réponse de la question
    await Question.findByIdAndUpdate(
      reponse.idquestion,
      { $pull: { reponses: reponse._id } }
    );

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Noter une réponse
exports.noterReponse = async (req, res, next) => {
  try {
    const reponse = await Reponse.findById(req.params.id);

    if (!reponse) {
      return res.status(404).json({
        status: 'error',
        message: 'Réponse non trouvée'
      });
    }

    reponse.note = req.body.note;
    reponse.estNote = true;
    await reponse.save();

    res.status(200).json({
      status: 'success',
      data: {
        reponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les réponses d'un étudiant
exports.getReponsesEtudiant = async (req, res, next) => {
  try {
    const reponses = await Reponse.find({
      idetudiant: req.user._id
    })
      .populate('idquestion', 'commentaire')
      .populate('idquestion.idexamen', 'nomexamen');

    res.status(200).json({
      status: 'success',
      results: reponses.length,
      data: {
        reponses
      }
    });
  } catch (error) {
    next(error);
  }
}; 