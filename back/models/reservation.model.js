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
  messageClient: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageTatoueur: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'annulee_client', 'annulee_tatoueur', 'terminee'],
    default: 'en_attente'
  },
  dateReservation: {
    type: Date,
    default: Date.now
  },
  dateReponse: {
    type: Date
  },
  dateAnnulation: {
    type: Date
  },
  raisonAnnulation: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
reservationSchema.index({ idClient: 1, statut: 1 });
reservationSchema.index({ idTatoueur: 1, statut: 1 });
reservationSchema.index({ idFlash: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);