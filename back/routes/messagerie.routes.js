const {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  createReservationMessage
} = require("../controllers/messagerie.controllers");
const authentification = require("../middlewares/auth");

const router = require("express").Router();

// Toutes les routes nécessitent une authentification
router.use(authentification);

// GET /api/messageries - Récupérer toutes les conversations de l'utilisateur
router.get("/", getConversations);

// GET /api/messageries/:conversationId - Récupérer une conversation spécifique
router.get("/:conversationId", getConversation);

// POST /api/messageries/send - Envoyer un message
router.post("/send", sendMessage);

// PUT /api/messageries/:messageId/read - Marquer un message comme lu
router.put("/:messageId/read", markAsRead);

// POST /api/messageries/reservation - Créer une conversation pour une réservation de flash
router.post("/reservation", createReservationMessage);


module.exports = router;