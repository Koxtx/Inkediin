const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Tatoueur', 'Client']
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'reservation', 'like', 'commentaire', 'follow', 'system']
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 255
  },
  date: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // ID de l'objet lié (flash, message, etc.)
  },
  relatedType: {
    type: String,
    enum: ['Flash', 'Messagerie', 'Feed', 'Reservation'],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
