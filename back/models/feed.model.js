const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  idTatoueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tatoueur',
    required: true
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 2000
  },
  image: {
    type: String, // URL de l'image
    default: null
  },
  datePublication: {
    type: Date,
    default: Date.now
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'likes.userType'
    },
    userType: {
      type: String,
      enum: ['Tatoueur', 'Client']
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
      enum: ['Tatoueur', 'Client']
    },
    contenu: {
      type: String,
      required: true,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Feed', feedSchema);