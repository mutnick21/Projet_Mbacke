const mongoose = require('mongoose');

const progressionEtudiantSchema = new mongoose.Schema({
  idetudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  niveau: {
    type: Number,
    default: 1,
    min: 1
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

const ProgressionEtudiant = mongoose.model('ProgressionEtudiant', progressionEtudiantSchema);

module.exports = ProgressionEtudiant; 