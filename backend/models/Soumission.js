const mongoose = require('mongoose');

const soumissionSchema = new mongoose.Schema({
  idetudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idexamen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examen',
    required: true
  },
  dateSoumission: {
    type: Date,
    default: Date.now
  },
  fichier: {
    type: String,
    required: [true, 'Le fichier de soumission est requis']
  },
  note: {
    type: Number,
    min: [0, 'La note ne peut pas être négative'],
    max: [20, 'La note ne peut pas dépasser 20']
  },
  commentaire: {
    type: String
  },
  status: {
    type: String,
    enum: ['soumis', 'en_cours_correction', 'corrige'],
    default: 'soumis'
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
soumissionSchema.index({ idetudiant: 1, idexamen: 1 }, { unique: true });
soumissionSchema.index({ idexamen: 1, status: 1 });

const Soumission = mongoose.model('Soumission', soumissionSchema);

module.exports = Soumission; 