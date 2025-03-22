const mongoose = require('mongoose');

const reponseSchema = new mongoose.Schema({
  idquestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  idexamen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examen',
    required: true
  },
  idetudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  fichierReponse: {
    nom: String,
    chemin: String,
    type: String,
    taille: Number
  },
  commentaire: {
    type: String,
    default: ''
  },
  note: {
    type: Number,
    min: 0,
    default: null
  },
  corrige: {
    type: Boolean,
    default: false
  },
  correction: {
    type: String,
    default: ''
  },
  dateSoumission: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour éviter les doublons de réponses
reponseSchema.index({ idquestion: 1, idetudiant: 1 }, { unique: true });

module.exports = mongoose.model('Reponse', reponseSchema); 