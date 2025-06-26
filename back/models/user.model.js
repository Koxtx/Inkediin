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
      type: String, // URL Cloudinary
      default: null,
    },
    cloudinaryAvatarId: {
      type: String,
      default: null,
    },
    localisation: {
      type: String,
      default: null,
    },
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
    
    // ✅ FOCUS: Relations et contenus sauvegardés
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
    ref: 'Feed', // ✅ Référence vers le modèle Feed
    default: []
  }],
  
  savedFlashs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flash', // ✅ Référence vers le modèle Flash
    default: []
  }],

    // Préférences utilisateur
    preferences: {
      preferredStyles: [{ 
        type: String,
        trim: true
      }],
      maxDistance: { 
        type: Number, 
        default: 50,
        min: 1,
        max: 500
      },
      minRating: { 
        type: Number, 
        default: 4.0,
        min: 1.0,
        max: 5.0
      },
      priceRange: {
        min: { 
          type: Number, 
          default: 0,
          min: 0
        },
        max: { 
          type: Number, 
          default: 1000,
          min: 0
        }
      },
      experienceLevel: { 
        type: String, 
        enum: ['any', 'junior', 'intermediate', 'expert'], 
        default: 'any' 
      },
      verifiedOnly: { 
        type: Boolean, 
        default: false 
      },
      notifications: {
        newArtists: { 
          type: Boolean, 
          default: true 
        },
        priceDrops: { 
          type: Boolean, 
          default: true 
        },
        recommendations: { 
          type: Boolean, 
          default: true 
        },
        followersUpdates: {
          type: Boolean,
          default: true
        }
      }
    },

    // Tracking des interactions pour les recommandations
    recommendationInteractions: [{
      _id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId() 
      },
      artistId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
      },
      interactionType: { 
        type: String, 
        enum: ['view', 'like', 'follow', 'contact', 'dismiss', 'profile_visit'], 
        required: true
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      },
      metadata: {
        source: {
          type: String,
          enum: ['recommendations', 'search', 'profile', 'feed'],
          default: 'recommendations'
        },
        context: {
          type: String,
          default: null
        }
      }
    }],

    preferencesUpdatedAt: { 
      type: Date, 
      default: Date.now 
    },
    lastRecommendationUpdate: {
      type: Date,
      default: Date.now
    },
    
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
userSchema.index({ ville: 1 });
userSchema.index({ savedFlashs: 1 });
userSchema.index({ savedPosts: 1 });
userSchema.index({ following: 1 });
userSchema.index({ tatoueursSuivis: 1 });

// ✅ MÉTHODES VIRTUELLES pour les compteurs
userSchema.virtual('savedPostsCount').get(function() {
  return this.savedPosts ? this.savedPosts.length : 0;
});

userSchema.virtual('savedFlashsCount').get(function() {
  return this.savedFlashs ? this.savedFlashs.length : 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

userSchema.virtual('followersCount').get(function() {
  return this.tatoueursSuivis ? this.tatoueursSuivis.length : 0;
});

userSchema.virtual('totalSavedContent').get(function() {
  return this.savedPostsCount + this.savedFlashsCount;
});

// ✅ MÉTHODES D'INSTANCE pour la gestion des flashs sauvegardés
userSchema.methods.isFlashSaved = function(flashId) {
  return this.savedFlashs.some(id => id.toString() === flashId.toString());
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
  
  return this.savedFlashs.length < initialLength;
};

userSchema.methods.toggleSaveFlash = function(flashId) {
  const flashIdString = flashId.toString();
  const isCurrentlySaved = this.savedFlashs.some(id => id.toString() === flashIdString);
  
  if (isCurrentlySaved) {
    // Retirer le flash des sauvegardés
    this.savedFlashs = this.savedFlashs.filter(id => id.toString() !== flashIdString);
    return { saved: false, action: 'removed' };
  } else {
    // Ajouter le flash aux sauvegardés
    this.savedFlashs.push(flashId);
    return { saved: true, action: 'added' };
  }
};

// ✅ MÉTHODES D'INSTANCE pour la gestion des publications sauvegardées
userSchema.methods.isPostSaved = function(postId) {
  return this.savedPosts.some(id => id.toString() === postId.toString());
};

userSchema.methods.toggleSavePost = function(postId) {
  const postIdString = postId.toString();
  const isCurrentlySaved = this.savedPosts.some(id => id.toString() === postIdString);
  
  if (isCurrentlySaved) {
    // Retirer le post des sauvegardés
    this.savedPosts = this.savedPosts.filter(id => id.toString() !== postIdString);
    return { saved: false, action: 'removed' };
  } else {
    // Ajouter le post aux sauvegardés
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

// ✅ MÉTHODES pour les interactions de recommandation
userSchema.methods.addRecommendationInteraction = function(artistId, interactionType, metadata = {}) {
  if (!this.recommendationInteractions) this.recommendationInteractions = [];
  
  const interaction = {
    _id: new mongoose.Types.ObjectId(),
    artistId,
    interactionType,
    timestamp: new Date(),
    metadata
  };
  
  this.recommendationInteractions.push(interaction);
  
  // Garder seulement les 100 dernières interactions
  if (this.recommendationInteractions.length > 100) {
    this.recommendationInteractions = this.recommendationInteractions.slice(-100);
  }
  
  return interaction;
};

// ✅ MÉTHODES pour les préférences
userSchema.methods.updatePreferences = function(newPreferences) {
  if (!this.preferences) this.preferences = {};
  
  Object.keys(newPreferences).forEach(key => {
    if (newPreferences[key] !== undefined) {
      this.preferences[key] = newPreferences[key];
    }
  });
  
  this.preferencesUpdatedAt = new Date();
  return this.preferences;
};

userSchema.methods.hasPreferences = function() {
  return this.preferences && Object.keys(this.preferences).length > 0;
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
  
  if (this.tatoueursSuivis && Array.isArray(this.tatoueursSuivis)) {
    this.tatoueursSuivis = [...new Set(this.tatoueursSuivis.map(id => id.toString()))];
  }
  
  // Nettoyer les champs string
  if (this.nom) this.nom = this.nom.trim();
  if (this.bio) this.bio = this.bio.trim();
  if (this.localisation) this.localisation = this.localisation.trim();
  if (this.ville) this.ville = this.ville.trim();
  if (this.styles) this.styles = this.styles.trim();
  
  next();
});

// ✅ MIDDLEWARE: Initialiser les préférences par défaut pour les nouveaux utilisateurs
userSchema.pre('save', function(next) {
  if (this.isNew && !this.preferences) {
    this.preferences = {
      preferredStyles: [],
      maxDistance: 50,
      minRating: 4.0,
      priceRange: { min: 0, max: 1000 },
      experienceLevel: 'any',
      verifiedOnly: false,
      notifications: {
        newArtists: true,
        priceDrops: true,
        recommendations: true,
        followersUpdates: true
      }
    };
    this.preferencesUpdatedAt = new Date();
  }
  next();
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

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", userSchema);