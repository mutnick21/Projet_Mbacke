import mongoose from 'mongoose';

const groupeSchema = new mongoose.Schema({
  nomgroupe: {
    type: String,
    required: [true, 'Le nom du groupe est requis'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description du groupe est requise']
  },
  niveau: {
    type: String,
    required: [true, 'Le niveau du groupe est requis'],
    enum: ['L1', 'L2', 'L3', 'M1', 'M2']
  },
  annee: {
    type: Number,
    required: [true, 'L\'année du groupe est requise']
  },
  idenseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  etudiants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matieres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere'
  }]
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
groupeSchema.index({ niveau: 1, annee: 1 });
groupeSchema.index({ idenseignant: 1 });
groupeSchema.index({ etudiants: 1 });

const Groupe = mongoose.model('Groupe', groupeSchema);

export default Groupe;