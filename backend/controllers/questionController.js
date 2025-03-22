const Question = require('../models/Question');
const Examen = require('../models/Examen');
const Reponse = require('../models/Reponse');

// Créer une nouvelle question
exports.createQuestion = async (req, res, next) => {
  try {
    // Vérifier si l'examen existe
    const examen = await Examen.findById(req.body.idexamen);
    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    // Vérifier si l'enseignant est responsable de l'examen
    if (examen.idenseignant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à ajouter des questions à cet examen'
      });
    }

    const question = await Question.create({
      ...req.body,
      idenseignant: req.user._id
    });

    // Ajouter la question à l'examen
    examen.questions.push(question._id);
    await examen.save();

    res.status(201).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir toutes les questions d'un examen
exports.getQuestionsExamen = async (req, res, next) => {
  try {
    const questions = await Question.find({ idexamen: req.params.examenId })
      .populate('idenseignant', 'nom prenom');

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir une question spécifique
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('idenseignant', 'nom prenom')
      .populate('idexamen', 'nomexamen');

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une question
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question non trouvée'
      });
    }

    // Vérifier si l'enseignant est responsable de la question
    if (question.idenseignant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à modifier cette question'
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        question: updatedQuestion
      }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question non trouvée'
      });
    }

    // Vérifier si l'enseignant est responsable de la question
    if (question.idenseignant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à supprimer cette question'
      });
    }

    // Supprimer la question de l'examen
    await Examen.findByIdAndUpdate(question.idexamen, {
      $pull: { questions: question._id }
    });

    // Supprimer toutes les réponses associées
    await Reponse.deleteMany({ idquestion: question._id });

    // Supprimer la question
    await question.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Noter une question
exports.noterQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question non trouvée'
      });
    }

    // Vérifier si l'enseignant est responsable de la question
    if (question.idenseignant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à noter cette question'
      });
    }

    const reponse = await Reponse.findOne({ idquestion: question._id });
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