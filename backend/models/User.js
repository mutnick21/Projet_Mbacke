import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    get: function (v) {
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    get: function (v) {
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false,
  },
  role: {
    type: String,
    enum: ['etudiant', 'enseignant'],
    default: 'etudiant',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  matieresEnseignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Matiere',
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
    },
  ],
  historiqueConnexions: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      appareil: String,
    },
  ],
  preferences: {
    langue: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      application: {
        type: Boolean,
        default: true,
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'suspendu'],
    default: 'actif',
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  groupes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Groupe',
    },
  ],
  examens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examen',
    },
  ],
  copies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Copie',
    },
  ],
  derniere_connexion: {
    type: Date,
    default: null,
  },
  date_creation: {
    type: Date,
    default: Date.now,
    get: function (v) {
      return v.toLocaleDateString('fr-FR');
    },
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
  discriminatorKey: 'role',
});

// Méthodes virtuelles
userSchema.virtual('nom_complet').get(function () {
  return `${this.prenom} ${this.nom}`;
});

userSchema.virtual('est_enseignant').get(function () {
  return this.role === 'enseignant';
});

userSchema.virtual('est_etudiant').get(function () {
  return this.role === 'etudiant';
});

// Méthodes d'instance
userSchema.methods.verifierPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genererTokenReinitialisation = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 3600000; // 1 heure
  return resetToken;
};

// Méthodes statiques
userSchema.statics.getEtudiants = function () {
  return this.find({ role: 'etudiant' });
};

userSchema.statics.getEnseignants = function () {
  return this.find({ role: 'enseignant' });
};

// Middleware pre-save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour enregistrer une connexion
userSchema.methods.logConnection = function (ip, appareil) {
  this.historiqueConnexions.push({ ip, appareil });
  if (this.historiqueConnexions.length > 10) {
    this.historiqueConnexions = this.historiqueConnexions.slice(-10);
  }
};

// Méthode pour vérifier si l'utilisateur peut accéder à une matière
userSchema.methods.peutAccederMatiere = function (matiereId) {
  return this.role === 'admin' ||
    (this.role === 'enseignant' && this.matieresEnseignees.includes(matiereId));
};

// Méthode pour comparer les mots de passe
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('Mot de passe incorrect');
  }
  throw Error('Email incorrect');
};

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ groupes: 1 });

const User = mongoose.model('User', userSchema);

export default User;