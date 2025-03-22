const ResultatExamen = require('../models/ResultatExamen');
const Examen = require('../models/Examen');
const Reponse = require('../models/Reponse');

// Calculer le résultat d'un examen pour un étudiant
exports.calculerResultat = async (req, res, next) => {
  try {
    const examen = await Examen.findById(req.params.examenId);
    if (!examen) {
      return res.status(404).json({
        status: 'error',
        message: 'Examen non trouvé'
      });
    }

    // Vérifier si l'étudiant a accès à l'examen
    const groupeAutorise = examen.groupes.some(groupe => 
      groupe.etudiants.includes(req.user._id)
    );

    if (!groupeAutorise) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à voir les résultats de cet examen'
      });
    }

    // Récupérer toutes les réponses de l'étudiant pour cet examen
    const reponses = await Reponse.find({
      idetudiant: req.user._id,
      idquestion: { $in: examen.questions }
    }).populate('idquestion');

    // Calculer le score total
    let scoreTotal = 0;
    let scoreMax = 0;

    reponses.forEach(reponse => {
      if (reponse.note !== undefined) {
        scoreTotal += reponse.note;
        scoreMax += reponse.idquestion.points;
      }
    });

    // Créer ou mettre à jour le résultat
    const resultat = await ResultatExamen.findOneAndUpdate(
      {
        idexamen: req.params.examenId,
        idetudiant: req.user._id
      },
      {
        score: scoreTotal,
        scoreMax: scoreMax,
        pourcentage: (scoreTotal / scoreMax) * 100
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        resultat
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les résultats d'un examen (pour les enseignants)
exports.getResultatsExamen = async (req, res, next) => {
  try {
    const examen = await Examen.findById(req.params.examenId);
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
        message: 'Vous n\'êtes pas autorisé à voir les résultats de cet examen'
      });
    }

    const resultats = await ResultatExamen.find({ idexamen: req.params.examenId })
      .populate('idetudiant', 'nom prenom');

    res.status(200).json({
      status: 'success',
      results: resultats.length,
      data: {
        resultats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les résultats d'un étudiant
exports.getResultatsEtudiant = async (req, res, next) => {
  try {
    const resultats = await ResultatExamen.find({ idetudiant: req.user._id })
      .populate('idexamen', 'titre date');

    res.status(200).json({
      status: 'success',
      results: resultats.length,
      data: {
        resultats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir un résultat spécifique
exports.getResultat = async (req, res, next) => {
  try {
    const resultat = await ResultatExamen.findById(req.params.id)
      .populate('idexamen')
      .populate('idetudiant', 'nom prenom');

    if (!resultat) {
      return res.status(404).json({
        status: 'error',
        message: 'Résultat non trouvé'
      });
    }

    // Vérifier si l'utilisateur a accès à ce résultat
    if (resultat.idetudiant._id.toString() !== req.user._id.toString() &&
        resultat.idexamen.idenseignant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à voir ce résultat'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        resultat
      }
    });
  } catch (error) {
    next(error);
  }
}; 