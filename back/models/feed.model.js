const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence vers le modèle User unifié
    required: true,
    index: true
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  datePublication: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Référence vers User au lieu de refPath
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'], // Correspond aux valeurs de votre userType
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  commentaires: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Référence vers User au lieu de refPath
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'], // Correspond aux valeurs de votre userType
      required: true
    },
    contenu: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Index composé pour améliorer les performances
feedSchema.index({ idTatoueur: 1, datePublication: -1 });
feedSchema.index({ datePublication: -1 });
feedSchema.index({ tags: 1 });
feedSchema.index({ 'likes.userId': 1 });

// Méthode virtuelle pour compter les likes
feedSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Méthode virtuelle pour compter les commentaires
feedSchema.virtual('commentsCount').get(function() {
  return this.commentaires.length;
});

// Méthode pour vérifier si un utilisateur a liké la publication
feedSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.userId.toString() === userId.toString());
};

// Méthode pour obtenir les tags les plus populaires
feedSchema.statics.getPopularTags = function(limit = 10) {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Middleware pre-save pour nettoyer les tags
feedSchema.pre('save', function(next) {
  if (this.tags) {
    this.tags = this.tags
      .filter(tag => tag && tag.trim())
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10); // Limiter à 10 tags maximum
  }
  next();
});

// Inclure les virtuels dans JSON
feedSchema.set('toJSON', { virtuals: true });
feedSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Feed', feedSchema);