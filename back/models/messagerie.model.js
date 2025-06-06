const mongoose = require('mongoose');

const messagerieSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  expediteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinataireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['message', 'reservation_flash'],
    default: 'message'
  },
  flashId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flash',
    required: function() {
      return this.type === 'reservation_flash';
    }
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateLecture: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Messagerie', messagerieSchema);