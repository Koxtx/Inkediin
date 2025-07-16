const {
  getFlashs,
  getFlashById,
  createFlash,
  updateFlash,
  deleteFlash,
  getFlashsByTatoueur,
  toggleReserve,
  likeFlash,
  reserveFlash,
  saveFlash,
  getSavedFlashs,
  addComment,
  deleteComment,
  likeComment,
  addReplyToComment,
  likeReply,
  deleteReply,
  unsaveFlash
} = require("../controllers/flash.controllers");

const router = require("express").Router();
const authentification = require("../middlewares/auth");
const {
  uploadFlash,
  uploadFlashToCloudinary,
} = require("../middlewares/uplodCloudinary");




router.get("/", getFlashs);


router.get("/saved", authentification, getSavedFlashs);


router.get("/search", getFlashs); 


router.get("/tatoueur/:tatoueurId", getFlashsByTatoueur);

router.post(
  "/",
  authentification,
  uploadFlash,
  uploadFlashToCloudinary,
  createFlash
);


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

router.post("/:id/save", authentification, saveFlash);
router.delete("/:id/save", authentification, unsaveFlash); 


router.post("/:id/comments", authentification, addComment);
router.delete("/:id/comments/:commentId", authentification, deleteComment);
router.post("/:id/comments/:commentId/like", authentification, likeComment);


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
