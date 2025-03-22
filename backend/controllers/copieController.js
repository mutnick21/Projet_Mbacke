const { Copie } = require('../models');
const { Examen } = require('../models');
const { ResultatExamen } = require('../models');

// Créer une copie d'examen
exports.createCopie = async (req, res, next) => {
  try {
    // Vérifier si l'étudiant a déjà soumis une copie pour cet examen
    const copieExistante = await Copie.findOne({
      idetudiant: req.user._id,
      idexamen: req.body.idexamen
    });

    if (copieExistante) {
      return res.status(400).json({
        status: 'error',
        message: 'Vous avez déjà soumis une copie pour cet examen'
      });
    }

    const copie = await Copie.create({
      ...req.body,
      idetudiant: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        copie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir toutes les copies d'un examen
exports.getCopiesExamen = async (req, res, next) => {
  try {
    const copies = await Copie.find({ idexamen: req.params.examenId })
      .populate('idetudiant', 'nom prenom');

    res.status(200).json({
      status: 'success',
      results: copies.length,
      data: {
        copies
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir une copie spécifique
exports.getCopie = async (req, res, next) => {
  try {
    const copie = await Copie.findById(req.params.id)
      .populate('idetudiant', 'nom prenom')
      .populate('idexamen', 'nomexamen');

    if (!copie) {
      return res.status(404).json({
        status: 'error',
        message: 'Copie non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        copie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une copie
exports.updateCopie = async (req, res, next) => {
  try {
    const copie = await Copie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!copie) {
      return res.status(404).json({
        status: 'error',
        message: 'Copie non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        copie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une copie
exports.deleteCopie = async (req, res, next) => {
  try {
    const copie = await Copie.findByIdAndDelete(req.params.id);

    if (!copie) {
      return res.status(404).json({
        status: 'error',
        message: 'Copie non trouvée'
      });
    }

    // Supprimer le résultat associé
    await ResultatExamen.findOneAndDelete({
      idetudiant: copie.idetudiant,
      idexamen: copie.idexamen
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Noter une copie
exports.noterCopie = async (req, res, next) => {
  try {
    const copie = await Copie.findById(req.params.id);

    if (!copie) {
      return res.status(404).json({
        status: 'error',
        message: 'Copie non trouvée'
      });
    }

    copie.note = req.body.note;
    copie.estNote = true;
    await copie.save();

    // Créer ou mettre à jour le résultat de l'examen
    await ResultatExamen.findOneAndUpdate(
      {
        idetudiant: copie.idetudiant,
        idexamen: copie.idexamen
      },
      {
        noteFinale: req.body.note,
        estReussi: req.body.note >= 10,
        dateFin: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        copie
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les copies d'un étudiant
exports.getCopiesEtudiant = async (req, res, next) => {
  try {
    const copies = await Copie.find({
      idetudiant: req.user._id
    })
      .populate('idexamen', 'nomexamen')
      .populate('idexamen.matiere', 'nom');

    res.status(200).json({
      status: 'success',
      results: copies.length,
      data: {
        copies
      }
    });
  } catch (error) {
    next(error);
  }
}; 