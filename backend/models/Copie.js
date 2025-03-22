const mongoose = require('mongoose');

const copieSchema = new mongoose.Schema({
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
  note: {
    type: Number,
    min: 0
  },
  estNote: {
    type: Boolean,
    default: false
  },
  datedepot: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
copieSchema.index({ idetudiant: 1, idexamen: 1 });
copieSchema.index({ datedepot: 1 });

const Copie = mongoose.model('Copie', copieSchema);

module.exports = Copie; 