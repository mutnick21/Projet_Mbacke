const mongoose = require('mongoose');

const examenSchema = new mongoose.Schema({
  idexman: {
    type: String,
    required: true,
    unique: true
  },
  nomexamen: {
    type: String,
    required: [true, 'Le nom de l\'examen est requis']
  },
  dateexamen: {
    type: Date,
    required: [true, 'La date d\'examen est requise']
  },
  datelimite: {
    type: Date,
    required: [true, 'La date limite est requise']
  },
  idenseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  groupes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Groupe'
  }]
}, {
  timestamps: true
});

const Examen = mongoose.model('Examen', examenSchema);

module.exports = Examen; 