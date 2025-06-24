const {
  getFlashs,
  getFlashById,
  createFlash,
  updateFlash,
  deleteFlash,
  getFlashsByTatoueur,
  toggleReserve,
  // ✅ NOUVELLES FONCTIONS
  likeFlash,

  reserveFlash,
  // ✅ FONCTIONS SAVE ET COMMENTAIRES
  saveFlash,
  getSavedFlashs,
  addComment,
  deleteComment,
  likeComment,
  addReplyToComment,
  likeReply,
  deleteReply,
} = require("../controllers/flash.controllers");

const router = require("express").Router();
const authentification = require("../middlewares/auth");
const {
  uploadFlash,
  uploadFlashToCloudinary,
} = require("../middlewares/uplodCloudinary");

// ⚠️ ORDRE IMPORTANT : Routes spécifiques AVANT les routes avec paramètres

// 1. Routes publiques spécifiques (sans paramètres)
router.get("/", getFlashs);

// 2. Routes protégées spécifiques (sans paramètres)
router.get("/saved", authentification, getSavedFlashs);

// 3. Route de recherche et filtres
router.get("/search", getFlashs); // Utilise les mêmes filtres que getFlashs

// 4. Routes avec préfixe spécifique + paramètre
router.get("/tatoueur/:tatoueurId", getFlashsByTatoueur);

// 5. Routes de création avec upload Cloudinary
router.post(
  "/",
  authentification,
  uploadFlash,
  uploadFlashToCloudinary,
  createFlash
);

// 6. Routes avec paramètre simple - APRÈS toutes les routes spécifiques
router.get("/:id", getFlashById);
router.put(
  "/:id",
  authentification,
  uploadFlash,
  uploadFlashToCloudinary,
  updateFlash
);
router.delete("/:id", authentification, deleteFlash);

// 7. Routes d'actions sur un flash spécifique
router.post("/:id/like", authentification, likeFlash);

router.post("/:id/reserve", authentification, reserveFlash);
router.patch("/:id/reserve", authentification, toggleReserve);

// ✅ NOUVELLES ROUTES: Sauvegarde
router.post("/:id/save", authentification, saveFlash);
router.delete("/:id/save", authentification, saveFlash); // Même fonction, toggle automatique

// ✅ NOUVELLES ROUTES: Commentaires
router.post("/:id/comments", authentification, addComment);
router.delete("/:id/comments/:commentId", authentification, deleteComment);
router.post("/:id/comments/:commentId/like", authentification, likeComment);

// ✅ NOUVELLES ROUTES: Réponses aux commentaires
router.post(
  "/:id/comments/:commentId/replies",
  authentification,
  addReplyToComment
);
router.post(
  "/:id/comments/:commentId/replies/:replyId/like",
  authentification,
  likeReply
);
router.delete(
  "/:id/comments/:commentId/replies/:replyId",
  authentification,
  deleteReply
);

module.exports = router;
