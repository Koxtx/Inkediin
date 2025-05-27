const mongoose = require('mongoose');

const tatoueurSchema = new mongoose.Schema({
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
  photosProfil: {
    type: String, // URL de l'image
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  localisation: {
    type: String,
    required: true
  },
  styles: {
    type: String,
    default: null
  },
  portfolio: {
    type: String, // URL ou texte de description
    default: null
  },
  followers: {
    type: String,
    default: "0"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tatoueur', tatoueurSchema);