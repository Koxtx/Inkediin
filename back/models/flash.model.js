const mongoose = require('mongoose');

const flashSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tatoueur',
    required: true
  },
  image: {
    type: String,
    required: true // URL de l'image du flash
  },
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: 1000
  },
  disponible: {
    type: Boolean,
    default: true
  },
  reserve: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flash', flashSchema);