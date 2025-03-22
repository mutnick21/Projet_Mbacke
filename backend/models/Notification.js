const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  idetudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Le message de la notification est requis']
  },
  type: {
    type: String,
    enum: ['examen', 'resultat'],
    required: true
  },
  estLu: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 