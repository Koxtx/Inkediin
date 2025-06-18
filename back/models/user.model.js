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
    resetToken: { 
      type: String 
    },
    
    // === AJOUTS POUR LES FONCTIONNALITÉS SOCIALES ===
    
    // Publications sauvegardées (pour tous les utilisateurs)
    savedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    }],
    
    // Système de suivi pour les tatoueurs
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Un tatoueur peut suivre d'autres tatoueurs
    }],
    followersList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Liste des utilisateurs qui suivent ce tatoueur
    }],
    
    // Système de suivi pour les clients
    tatoueursSuivis: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Liste des tatoueurs suivis par ce client
    }],
    
    // Wishlist pour les clients
    wishlist: [{
      artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      style: String,
      notes: String,
      dateAdded: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Préférences pour les clients
    preferences: {
      favoriteStyles: [String],
      preferredLocations: [String],
      criteria: {
        hygiene: { type: Number, min: 1, max: 5, default: 3 },
        reputation: { type: Number, min: 1, max: 5, default: 3 },
        price: { type: Number, min: 1, max: 5, default: 3 },
        proximity: { type: Number, min: 1, max: 5, default: 3 }
      }
    },
    
    // Statistiques (calculées dynamiquement mais peuvent être cachées pour performance)
    stats: {
      publicationsCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
    }
  },
  {
    timestamps: true,
  }
);

// === MÉTHODES D'INSTANCE ===

// Pour les tatoueurs - vérifier si suit un autre tatoueur
userSchema.methods.isFollowing = function(targetId) {
  return this.following.some(id => id.equals(targetId));
};

// Pour les tatoueurs - vérifier si a un follower
userSchema.methods.hasFollower = function(followerId) {
  return this.followersList.some(id => id.equals(followerId));
};

// Pour les clients - vérifier si suit un tatoueur
userSchema.methods.isFollowingArtist = function(artistId) {
  return this.tatoueursSuivis.some(id => id.equals(artistId));
};

// Pour les clients - vérifier si artiste dans wishlist
userSchema.methods.hasInWishlist = function(artistId) {
  return this.wishlist.some(item => item.artistId.equals(artistId));
};

// Vérifier si une publication est sauvegardée
userSchema.methods.hasPostSaved = function(postId) {
  return this.savedPosts.some(id => id.equals(postId));
};

// === MÉTHODES STATIQUES ===

// Rechercher les tatoueurs par style
userSchema.statics.findTattooArtistsByStyle = function(style) {
  return this.find({
    userType: 'tatoueur',
    styles: { $regex: style, $options: 'i' }
  });
};

// Obtenir les tatoueurs populaires
userSchema.statics.getPopularArtists = function(limit = 10) {
  return this.find({ userType: 'tatoueur' })
    .sort({ 'stats.followersCount': -1 })
    .limit(limit);
};

// === HOOKS (MIDDLEWARE) ===

// Mise à jour des statistiques avant sauvegarde
userSchema.pre('save', function(next) {
  if (this.userType === 'tatoueur') {
    this.stats.followersCount = this.followersList.length;
    this.stats.followingCount = this.following.length;
  } else if (this.userType === 'client') {
    this.stats.followingCount = this.tatoueursSuivis.length;
  }
  next();
});

// === INDEX POUR PERFORMANCE ===
userSchema.index({ userType: 1 });
userSchema.index({ 'styles': 'text' });
userSchema.index({ localisation: 1 });
userSchema.index({ 'stats.followersCount': -1 });
userSchema.index({ tatoueursSuivis: 1 });
userSchema.index({ followersList: 1 });

module.exports = mongoose.model("User", userSchema);