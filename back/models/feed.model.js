const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tatoueur',
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
  datePublication: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'likes.userType'
    },
    userType: {
      type: String,
      enum: ['Tatoueur', 'Client'],
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
      refPath: 'commentaires.userType'
    },
    userType: {
      type: String,
      enum: ['Tatoueur', 'Client'],
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
  }]
}, {
  timestamps: true
});
// Index composé pour améliorer les performances
feedSchema.index({ idTatoueur: 1, datePublication: -1 });
feedSchema.index({ datePublication: -1 });

// Méthode virtuelle pour compter les likes
feedSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Méthode virtuelle pour compter les commentaires
feedSchema.virtual('commentsCount').get(function() {
  return this.commentaires.length;
});

// Inclure les virtuels dans JSON
feedSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Feed', feedSchema);