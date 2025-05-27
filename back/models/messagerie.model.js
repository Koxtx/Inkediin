const mongoose = require('mongoose');

const messagerieSchema = new mongoose.Schema({
  expediteurId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'expediteurType'
  },
  expediteurType: {
    type: String,
    required: true,
    enum: ['Tatoueur', 'Client']
  },
  destinataireId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'destinataireType'
  },
  destinataireType: {
    type: String,
    required: true,
    enum: ['Tatoueur', 'Client']
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 2000
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  },
  archivage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Messagerie', messagerieSchema);