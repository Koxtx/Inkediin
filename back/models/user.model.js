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
    // ✅ AJOUT: Ville séparée de la localisation
    ville: {
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
    
    // ✅ AJOUT PRINCIPAL: Flashs sauvegardés
    savedFlashs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flash'
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
userSchema.index({ ville: 1 }); // ✅ AJOUT: Index pour la ville
userSchema.index({ savedFlashs: 1 }); // ✅ AJOUT: Index pour les flashs sauvegardés

// ✅ MÉTHODES VIRTUELLES pour les compteurs
userSchema.virtual('savedFlashsCount').get(function() {
  return this.savedFlashs ? this.savedFlashs.length : 0;
});

userSchema.virtual('savedPostsCount').get(function() {
  return this.savedPosts ? this.savedPosts.length : 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

userSchema.virtual('followersCount').get(function() {
  return this.tatoueursSuivis ? this.tatoueursSuivis.length : 0;
});

// ✅ MÉTHODES D'INSTANCE pour la gestion des flashs sauvegardés
userSchema.methods.isFlashSaved = function(flashId) {
  if (!this.savedFlashs || !Array.isArray(this.savedFlashs)) return false;
  return this.savedFlashs.some(savedId => savedId.toString() === flashId.toString());
};

userSchema.methods.saveFlash = function(flashId) {
  if (!this.savedFlashs) this.savedFlashs = [];
  
  if (!this.isFlashSaved(flashId)) {
    this.savedFlashs.push(flashId);
    return true; // Flash ajouté
  }
  return false; // Flash déjà sauvegardé
};

userSchema.methods.unsaveFlash = function(flashId) {
  if (!this.savedFlashs || !Array.isArray(this.savedFlashs)) return false;
  
  const initialLength = this.savedFlashs.length;
  this.savedFlashs = this.savedFlashs.filter(savedId => savedId.toString() !== flashId.toString());
  
  return this.savedFlashs.length < initialLength; // Retourne true si un élément a été supprimé
};

userSchema.methods.toggleSaveFlash = function(flashId) {
  if (this.isFlashSaved(flashId)) {
    this.unsaveFlash(flashId);
    return { saved: false, action: 'removed' };
  } else {
    this.saveFlash(flashId);
    return { saved: true, action: 'added' };
  }
};

// ✅ MÉTHODES D'INSTANCE pour la gestion des publications sauvegardées
userSchema.methods.isPostSaved = function(postId) {
  if (!this.savedPosts || !Array.isArray(this.savedPosts)) return false;
  return this.savedPosts.some(savedId => savedId.toString() === postId.toString());
};

userSchema.methods.toggleSavePost = function(postId) {
  if (!this.savedPosts) this.savedPosts = [];
  
  if (this.isPostSaved(postId)) {
    this.savedPosts = this.savedPosts.filter(savedId => savedId.toString() !== postId.toString());
    return { saved: false, action: 'removed' };
  } else {
    this.savedPosts.push(postId);
    return { saved: true, action: 'added' };
  }
};

// ✅ MÉTHODES D'INSTANCE pour le suivi des tatoueurs
userSchema.methods.isFollowing = function(tatoueurId) {
  if (!this.following || !Array.isArray(this.following)) return false;
  return this.following.some(followedId => followedId.toString() === tatoueurId.toString());
};

userSchema.methods.toggleFollow = function(tatoueurId) {
  if (!this.following) this.following = [];
  
  if (this.isFollowing(tatoueurId)) {
    this.following = this.following.filter(followedId => followedId.toString() !== tatoueurId.toString());
    return { following: false, action: 'unfollowed' };
  } else {
    this.following.push(tatoueurId);
    return { following: true, action: 'followed' };
  }
};

// ✅ MIDDLEWARE pour nettoyer les données
userSchema.pre('save', function(next) {
  // Nettoyer les tableaux de doublons
  if (this.savedFlashs && Array.isArray(this.savedFlashs)) {
    this.savedFlashs = [...new Set(this.savedFlashs.map(id => id.toString()))];
  }
  
  if (this.savedPosts && Array.isArray(this.savedPosts)) {
    this.savedPosts = [...new Set(this.savedPosts.map(id => id.toString()))];
  }
  
  if (this.following && Array.isArray(this.following)) {
    this.following = [...new Set(this.following.map(id => id.toString()))];
  }
  
  // Nettoyer les champs string
  if (this.nom) this.nom = this.nom.trim();
  if (this.bio) this.bio = this.bio.trim();
  if (this.localisation) this.localisation = this.localisation.trim();
  if (this.ville) this.ville = this.ville.trim();
  if (this.styles) this.styles = this.styles.trim();
  
  next();
});

// ✅ MIDDLEWARE: Supprimer l'avatar Cloudinary à la suppression du user
userSchema.pre('findOneAndDelete', async function() {
  const user = await this.model.findOne(this.getQuery());
  if (user && user.cloudinaryAvatarId) {
    try {
      const { deleteAvatarFromCloudinary } = require("../middlewares/userUpload");
      await deleteAvatarFromCloudinary(user.cloudinaryAvatarId);
      console.log(`✅ Avatar Cloudinary supprimé pour l'utilisateur ${user._id}`);
    } catch (error) {
      console.error(`❌ Erreur suppression avatar Cloudinary:`, error);
    }
  }
});

// ✅ MIDDLEWARE: Log des opérations importantes
userSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`✅ Nouvel utilisateur créé: ${doc._id} (${doc.email})`);
  }
});

// S'assurer que les virtuels sont inclus dans JSON
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Supprimer les champs sensibles
    delete ret.password;
    delete ret.resetToken;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", userSchema);