const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'],
      default: null, // null jusqu'à ce que l'utilisateur choisisse
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    // Données du profil (optionnelles au début)
    nom: {
      type: String,
      trim: true,
      default: null,
    },
    photoProfil: {
      type: String,
      default: null,
    },
    localisation: {
      type: String,
      default: null,
    },
    // Champs spécifiques aux tatoueurs (optionnels)
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    styles: {
      type: String,
      default: null,
    },
   
    followers: {
      type: String,
      default: "0",
    },
     resetToken: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);