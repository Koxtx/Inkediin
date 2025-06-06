const Messagerie = require("../models/messagerie.model");
const Conversation = require("../models/conversation.model");
const { getReceiverSocketId, io } = require("../socket/socket");

// Récupérer toutes les conversations de l'utilisateur connecté
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'nom email photoProfil userType')
    .populate('dernierMessage')
    .populate('flashId', 'image prix description')
    .sort({ dateDernierMessage: -1 });

    // Ajouter le nombre de messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Messagerie.countDocuments({
          conversationId: conv._id,
          destinataireId: userId,
          lu: false
        });
        
        return {
          ...conv.toObject(),
          messagesNonLus: unreadCount
        };
      })
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une conversation spécifique avec tous ses messages
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Vérifier que l'utilisateur fait partie de cette conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'nom email photoProfil userType')
      .populate('flashId', 'image prix description');

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "Accès interdit à cette conversation" });
    }

    // Récupérer tous les messages de la conversation
    const messages = await Messagerie.find({ conversationId })
      .populate('expediteurId', 'nom photoProfil userType')
      .populate('destinataireId', 'nom photoProfil userType')
      .populate('flashId', 'image prix description')
      .sort({ dateEnvoi: 1 });

    // Marquer les messages comme lus
    await Messagerie.updateMany(
      { 
        conversationId, 
        destinataireId: userId, 
        lu: false 
      },
      { 
        lu: true, 
        dateLecture: new Date() 
      }
    );

    res.status(200).json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Erreur getConversation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Envoyer un message
const sendMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, conversationId } = req.body;
    const expediteurId = req.user._id;

    if (!destinataireId || !contenu) {
      return res.status(400).json({ message: "Destinataire et contenu requis" });
    }

    let conversation;

    if (conversationId) {
      // Conversation existante
      conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(expediteurId)) {
        return res.status(403).json({ message: "Accès interdit à cette conversation" });
      }
    } else {
      // Nouvelle conversation
      conversation = await Conversation.findOne({
        participants: { $all: [expediteurId, destinataireId] },
        type: 'normale'
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [expediteurId, destinataireId],
          type: 'normale'
        });
        await conversation.save();
      }
    }

    // Créer le message
    const nouveauMessage = new Messagerie({
      conversationId: conversation._id,
      expediteurId,
      destinataireId,
      contenu,
      type: 'message'
    });

    await nouveauMessage.save();

    // Mettre à jour la conversation
    conversation.dernierMessage = nouveauMessage._id;
    conversation.dateDernierMessage = new Date();
    await conversation.save();

    // Peupler le message pour l'envoyer via socket
    await nouveauMessage.populate('expediteurId', 'nom photoProfil userType');
    await nouveauMessage.populate('destinataireId', 'nom photoProfil userType');

    // Envoyer via WebSocket au destinataire s'il est en ligne
    const receiverSocketId = getReceiverSocketId(destinataireId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("nouveauMessage", {
        message: nouveauMessage,
        conversationId: conversation._id
      });
    }

    res.status(201).json(nouveauMessage);
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une conversation pour une réservation de flash
const createReservationMessage = async (req, res) => {
  try {
    const { flashId, tatoueurId, contenu } = req.body;
    const clientId = req.user._id;

    if (!flashId || !tatoueurId || !contenu) {
      return res.status(400).json({ 
        message: "Flash ID, tatoueur ID et message requis" 
      });
    }

    // Vérifier s'il existe déjà une conversation pour ce flash entre ces utilisateurs
    let conversation = await Conversation.findOne({
      participants: { $all: [clientId, tatoueurId] },
      flashId: flashId,
      type: 'reservation_flash'
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [clientId, tatoueurId],
        flashId: flashId,
        type: 'reservation_flash'
      });
      await conversation.save();
    }

    // Créer le message de réservation
    const messageReservation = new Messagerie({
      conversationId: conversation._id,
      expediteurId: clientId,
      destinataireId: tatoueurId,
      contenu,
      type: 'reservation_flash',
      flashId
    });

    await messageReservation.save();

    // Mettre à jour la conversation
    conversation.dernierMessage = messageReservation._id;
    conversation.dateDernierMessage = new Date();
    await conversation.save();

    // Peupler le message
    await messageReservation.populate('expediteurId', 'nom photoProfil userType');
    await messageReservation.populate('destinataireId', 'nom photoProfil userType');
    await messageReservation.populate('flashId', 'image prix description');

    // Notifier le tatoueur via WebSocket
    const receiverSocketId = getReceiverSocketId(tatoueurId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("nouvelleReservation", {
        message: messageReservation,
        conversationId: conversation._id
      });
    }

    res.status(201).json({
      message: messageReservation,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Erreur createReservationMessage:', error);
    res.status(500).json({ error: error.message });
  }
};

// Marquer un message comme lu
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Messagerie.findOneAndUpdate(
      { 
        _id: messageId, 
        destinataireId: userId 
      },
      { 
        lu: true, 
        dateLecture: new Date() 
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    res.status(200).json({ message: "Message marqué comme lu" });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  createReservationMessage
};