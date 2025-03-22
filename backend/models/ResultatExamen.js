const mongoose = require('mongoose');

const resultatExamenSchema = new mongoose.Schema({
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
  noteFinale: {
    type: Number,
    min: 0
  },
  estReussi: {
    type: Boolean,
    default: false
  },
  dateFin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ResultatExamen = mongoose.model('ResultatExamen', resultatExamenSchema);

module.exports = ResultatExamen; 