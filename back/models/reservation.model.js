const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  idClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  idFlash: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flash',
    required: true
  },
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tatoueur',
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'annulee', 'terminee'],
    default: 'en_attente'
  },
  dateReservation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
