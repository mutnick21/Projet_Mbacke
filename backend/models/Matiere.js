const mongoose = require('mongoose');

const matiereSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la matière est requis'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description de la matière est requise']
  },
  idenseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Matiere = mongoose.model('Matiere', matiereSchema);

module.exports = Matiere; 