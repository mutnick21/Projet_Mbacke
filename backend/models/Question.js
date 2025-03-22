const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  nombre: {
    type: Number,
    required: [true, 'Le numéro de la question est requis']
  },
  commentaire: {
    type: String
  },
  idetudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  idexamen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examen',
    required: true
  },
  idenseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enonce: {
    type: String,
    required: [true, 'L\'énoncé de la question est requis'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['qcm', 'texte', 'numerique', 'code', 'fichier'],
    default: 'qcm'
  },
  points: {
    type: Number,
    required: [true, 'Le nombre de points est requis'],
    min: [0, 'Le nombre de points doit être positif']
  },
  options: {
    type: [String],
    required: function() {
      return this.type === 'qcm';
    }
  },
  reponseCorrecte: {
    type: mongoose.Schema.Types.Mixed,
    required: function() {
      return this.type === 'qcm' || this.type === 'numerique';
    }
  },
  reponseType: {
    type: String,
    enum: ['texte', 'code', 'fichier'],
    required: function() {
      return this.type === 'texte' || this.type === 'code' || this.type === 'fichier';
    }
  },
  formatAttendu: {
    type: String,
    required: function() {
      return this.type === 'code';
    }
  },
  tailleMaxFichier: {
    type: Number,
    required: function() {
      return this.type === 'fichier';
    }
  },
  typesFichiersAcceptes: {
    type: [String],
    required: function() {
      return this.type === 'fichier';
    }
  },
  bareme: {
    type: Number,
    required: [true, 'Le barème est requis'],
    min: [0, 'Le barème doit être positif'],
    set: function(v) {
      return parseFloat(v.toFixed(2)); // Limiter à 2 décimales
    }
  },
  reponseAttendue: {
    type: String,
    trim: true,
    get: function(v) {
      if (this.type === 'code') {
        return v; // Pas de transformation pour le code
      }
      return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
    }
  },
  temps_estime: {
    type: Number,
    min: [1, 'Le temps estimé minimum est de 1 minute'],
    set: function(v) {
      return Math.round(v); // Arrondir à la minute près
    }
  },
  difficulte: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  mots_cles: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  date_creation: {
    type: Date,
    default: Date.now,
    get: function(v) {
      return v.toLocaleDateString('fr-FR');
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Méthodes virtuelles
questionSchema.virtual('nombre_options').get(function() {
  return this.type === 'qcm' ? this.options.length : 0;
});

questionSchema.virtual('est_qcm').get(function() {
  return this.type === 'qcm';
});

questionSchema.virtual('est_texte').get(function() {
  return this.type === 'texte';
});

questionSchema.virtual('est_code').get(function() {
  return this.type === 'code';
});

// Méthodes d'instance
questionSchema.methods.verifierReponse = function(reponseEtudiant) {
  if (this.type === 'qcm') {
    return this.options.find(opt => opt.estCorrecte)?.texte === reponseEtudiant;
  }
  return this.reponseAttendue === reponseEtudiant;
};

questionSchema.methods.ajouterOption = function(texte, estCorrecte = false) {
  if (this.type !== 'qcm') {
    throw new Error('Cette méthode n\'est disponible que pour les questions QCM');
  }
  this.options.push({ texte, estCorrecte });
  return this.save();
};

// Méthodes statiques
questionSchema.statics.getQuestionsByDifficulte = function(difficulte) {
  return this.find({ difficulte });
};

questionSchema.statics.getQuestionsByType = function(type) {
  return this.find({ type });
};

// Middleware pre-save
questionSchema.pre('save', function(next) {
  // Validation spécifique pour les QCM
  if (this.type === 'qcm' && this.isModified('options')) {
    const bonnesReponses = this.options.filter(opt => opt.estCorrecte);
    if (bonnesReponses.length !== 1) {
      next(new Error('Une question QCM doit avoir exactement une bonne réponse'));
    }
  }
  next();
});

// Index pour améliorer les performances des requêtes
questionSchema.index({ idexamen: 1 });
questionSchema.index({ idetudiant: 1, idenseignant: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 