const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  dernierMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Messagerie"
  },
  dateDernierMessage: {
    type: Date,
    default: Date.now
  },
  // Pour les conversations liées à des réservations de flash
  flashId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flash"
  },
  type: {
    type: String,
    enum: ['normale', 'reservation_flash'],
    default: 'normale'
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ dateDernierMessage: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);