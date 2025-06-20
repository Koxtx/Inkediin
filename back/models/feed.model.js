// ✅ CORRECTION du modèle Feed - Vérification du schema des likes

const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    lowercase: true
  }],
  datePublication: {
    type: Date,
    default: Date.now,
    index: true
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
      required: true
    },
    dateLike: {
      type: Date,
      default: Date.now
    }
  }],
  commentaires: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['client', 'tatoueur'],
      required: true
    },
    contenu: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true
    },
    dateCommentaire: {
      type: Date,
      default: Date.now
    },
    // ✅ CORRECTION: S'assurer que les likes des commentaires sont bien définis
    likes: {
      type: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userType: {
          type: String,
          enum: ['client', 'tatoueur'],
          required: true
        },
        dateLike: {
          type: Date,
          default: Date.now
        }
      }],
      default: [] // ✅ AJOUT: Valeur par défaut
    },
    replies: {
      type: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userType: {
          type: String,
          enum: ['client', 'tatoueur'],
          required: true
        },
        contenu: {
          type: String,
          required: true,
          maxlength: 500,
          trim: true
        },
        dateReponse: {
          type: Date,
          default: Date.now
        },
        likes: {
          type: [{
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true
            },
            userType: {
              type: String,
              enum: ['client', 'tatoueur'],
              required: true
            },
            dateLike: {
              type: Date,
              default: Date.now
            }
          }],
          default: [] // ✅ AJOUT: Valeur par défaut
        }
      }],
      default: [] // ✅ AJOUT: Valeur par défaut
    }
  }]
}, {
  timestamps: true
});

// ✅ AJOUT: Middleware pour initialiser les arrays si undefined
feedSchema.pre('save', function(next) {
  // Initialiser les likes de la publication
  if (!this.likes) this.likes = [];
  
  // Initialiser les arrays des commentaires
  if (this.commentaires) {
    this.commentaires.forEach(comment => {
      if (!comment.likes) comment.likes = [];
      if (!comment.replies) comment.replies = [];
      
      // Initialiser les likes des réponses
      if (comment.replies) {
        comment.replies.forEach(reply => {
          if (!reply.likes) reply.likes = [];
        });
      }
    });
  }
  
  next();
});

// Index composé pour améliorer les performances
feedSchema.index({ idTatoueur: 1, datePublication: -1 });
feedSchema.index({ datePublication: -1 });
feedSchema.index({ tags: 1 });

// Méthode virtuelle pour compter les likes
feedSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Méthode virtuelle pour compter les commentaires
feedSchema.virtual('commentsCount').get(function() {
  return this.commentaires ? this.commentaires.length : 0;
});

// Inclure les virtuels dans JSON
feedSchema.set('toJSON', { virtuals: true });
feedSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Feed', feedSchema);