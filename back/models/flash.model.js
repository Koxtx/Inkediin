const mongoose = require('mongoose');

const flashSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence vers le modèle User (tatoueur)
    required: true
  },
  
  // === INFORMATIONS DE BASE ===
  image: {
    type: String,
    required: true // URL de l'image du flash
  },
  cloudinaryPublicId: {
    type: String, // ID public Cloudinary pour gestion des images
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
  title: {
    type: String,
    maxlength: 200
  },
  artist: {
    type: String,
    maxlength: 100
  },
  
  // === STATUTS ===
  disponible: {
    type: Boolean,
    default: true
  },
  reserve: {
    type: Boolean,
    default: false
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservedAt: {
    type: Date
  },
  
  // === SYSTÈME DE LIKES ===
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'],
      default: 'client'
    },
    dateLike: {
      type: Date,
      default: Date.now
    }
  }],
  
  // === SYSTÈME DE VUES ===
  views: {
    type: Number,
    default: 0
  },
  
  // === SYSTÈME DE RATINGS/ÉTOILES ===
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    dateRating: {
      type: Date,
      default: Date.now
    }
  }],
  
  // === TAGS POUR CATÉGORISATION ===
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // === SYSTÈME DE COMMENTAIRES COMPLET ===
  commentaires: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'],
      default: 'client'
    },
    contenu: {
      type: String,
      required: true,
      maxlength: 1000
    },
    dateCommentaire: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userType: {
        type: String,
        enum: ['client', 'tatoueur'],
        default: 'client'
      },
      dateLike: {
        type: Date,
        default: Date.now
      }
    }],
    // Réponses aux commentaires
    replies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userType: {
        type: String,
        enum: ['client', 'tatoueur'],
        default: 'client'
      },
      contenu: {
        type: String,
        required: true,
        maxlength: 500
      },
      dateReponse: {
        type: Date,
        default: Date.now
      },
      likes: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userType: {
          type: String,
          enum: ['client', 'tatoueur'],
          default: 'client'
        },
        dateLike: {
          type: Date,
          default: Date.now
        }
      }]
    }]
  }],
  
  // === CARACTÉRISTIQUES DU FLASH ===
  style: {
    type: String,
    enum: [
      'traditionnel', 
      'realisme', 
      'blackwork', 
      'dotwork', 
      'geometrique', 
      'watercolor', 
      'tribal', 
      'japonais', 
      'autre'
    ],
    default: 'autre'
  },
  taille: {
    type: String,
    enum: ['petit', 'moyen', 'grand', 'tres-grand'],
    default: 'moyen'
  },
  emplacement: [{
    type: String,
    enum: [
      'bras', 
      'jambe', 
      'dos', 
      'torse', 
      'main', 
      'pied', 
      'cou', 
      'visage', 
      'autre'
    ]
  }],
  
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// === INDEX POUR AMÉLIORER LES PERFORMANCES ===
flashSchema.index({ idTatoueur: 1, date: -1 });
flashSchema.index({ disponible: 1, reserve: 1 });
flashSchema.index({ prix: 1 });
flashSchema.index({ tags: 1 });
flashSchema.index({ style: 1 });
flashSchema.index({ views: -1 });
flashSchema.index({ 'likes.dateLike': -1 });

// === MÉTHODES VIRTUELLES ===
// Calcul de la note moyenne
flashSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10; // Arrondi à 1 décimale
});

// Nombre total de likes
flashSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Nombre total de commentaires (avec réponses)
flashSchema.virtual('commentsCount').get(function() {
  if (!this.commentaires) return 0;
  return this.commentaires.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);
});

// Nombre de ratings
flashSchema.virtual('ratingsCount').get(function() {
  return this.ratings ? this.ratings.length : 0;
});

// === MÉTHODES D'INSTANCE ===
// Vérifier si un utilisateur a liké ce flash
flashSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId.toString() === userId.toString());
};

// Vérifier si un utilisateur a noté ce flash
flashSchema.methods.isRatedBy = function(userId) {
  return this.ratings.some(rating => rating.userId.toString() === userId.toString());
};

// Obtenir la note d'un utilisateur
flashSchema.methods.getRatingByUser = function(userId) {
  const userRating = this.ratings.find(rating => rating.userId.toString() === userId.toString());
  return userRating ? userRating.rating : null;
};

// === MÉTHODES STATIQUES ===
// Recherche avancée de flashs
flashSchema.statics.findWithFilters = function(filters = {}) {
  const query = {};
  
  // Filtres de base
  if (filters.disponible !== undefined) query.disponible = filters.disponible;
  if (filters.tatoueur) query.idTatoueur = filters.tatoueur;
  if (filters.style) query.style = filters.style;
  if (filters.taille) query.taille = filters.taille;
  
  // Filtrage par prix
  if (filters.prixMin || filters.prixMax) {
    query.prix = {};
    if (filters.prixMin) query.prix.$gte = parseFloat(filters.prixMin);
    if (filters.prixMax) query.prix.$lte = parseFloat(filters.prixMax);
  }
  
  // Filtrage par tags
  if (filters.tags) {
    const tagArray = Array.isArray(filters.tags) 
      ? filters.tags 
      : filters.tags.split(",").map(tag => tag.trim().toLowerCase());
    query.tags = { $in: tagArray };
  }
  
  // Filtrage par emplacement
  if (filters.emplacement) {
    const emplacementArray = Array.isArray(filters.emplacement)
      ? filters.emplacement
      : filters.emplacement.split(",").map(e => e.trim());
    query.emplacement = { $in: emplacementArray };
  }
  
  return this.find(query);
};

// Obtenir les flashs populaires (basé sur les likes et vues)
flashSchema.statics.getPopular = function(limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        popularity: {
          $add: [
            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 2] }, // Likes x2
            { $divide: ["$views", 10] } // Vues / 10
          ]
        }
      }
    },
    { $sort: { popularity: -1, date: -1 } },
    { $limit: limit }
  ]);
};

// === MIDDLEWARE PRE/POST ===
// Middleware pre-save pour validation
flashSchema.pre('save', function(next) {
  // Validation des tags
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag);
    // Supprimer les doublons
    this.tags = [...new Set(this.tags)];
  }
  
  // Validation du prix
  if (this.prix && this.prix < 0) {
    return next(new Error('Le prix ne peut pas être négatif'));
  }
  
  next();
});

// Middleware post-save pour logging
flashSchema.post('save', function(doc) {
  console.log(`Flash ${doc._id} sauvegardé avec succès`);
});

// S'assurer que les virtuels sont inclus dans JSON
flashSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Supprimer les champs sensibles ou inutiles
    delete ret.__v;
    return ret;
  }
});

flashSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Flash', flashSchema);