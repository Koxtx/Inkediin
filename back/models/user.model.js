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
      default: null,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    // Données du profil
    nom: {
      type: String,
      trim: true,
      default: null,
    },
    photoProfil: {
      type: String, // ✅ URL Cloudinary
      default: null,
    },
    // ✅ AJOUT: ID Cloudinary pour pouvoir supprimer l'image
    cloudinaryAvatarId: {
      type: String,
      default: null,
    },
    localisation: {
      type: String,
      default: null,
    },
    // Champs spécifiques aux tatoueurs
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
    // Champs pour les relations et publications sauvées
    tatoueursSuivis: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    savedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    }],
    resetToken: { 
      type: String 
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ localisation: 1 });

// ✅ AJOUT: Middleware pour supprimer l'avatar Cloudinary à la suppression du user
userSchema.pre('findOneAndDelete', async function() {
  const user = await this.model.findOne(this.getQuery());
  if (user && user.cloudinaryAvatarId) {
    const { deleteAvatarFromCloudinary } = require("../middlewares/userUpload");
    await deleteAvatarFromCloudinary(user.cloudinaryAvatarId);
  }
});

module.exports = mongoose.model("User", userSchema);