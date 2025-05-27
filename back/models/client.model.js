const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  photoProfil: {
    type: String, // URL de l'image
    default: null
  },
  localisation: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
