const {
  createReservation,
  respondToReservation,
  cancelReservation,
  completeReservation,
  getReservations,
  getMyReservations,
  getReservationById
} = require("../controllers/reservation.controllers");

const router = require("express").Router();
const authentification = require("../middlewares/auth");
const { validateReservation, validateReservationResponse } = require("../middlewares/validation");

// Routes publiques (aucune pour les réservations)

// Routes protégées
router.get("/", authentification, getReservations); // Admin seulement
router.get("/mes-reservations", authentification, getMyReservations);
router.get("/:id", authentification, getReservationById);

router.post("/", authentification, validateReservation, createReservation);
router.patch("/:id/repondre", authentification, validateReservationResponse, respondToReservation);
router.patch("/:id/annuler", authentification, cancelReservation);
router.patch("/:id/terminer", authentification, completeReservation);

module.exports = router;