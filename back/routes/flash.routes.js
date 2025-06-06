const { 
  getFlashs, 
  getFlashById, 
  createFlash, 
  updateFlash, 
  deleteFlash,
  getFlashsByTatoueur,
  toggleReserve
} = require("../controllers/flash.controllers");

const router = require("express").Router();
const authentification = require("../middlewares/auth");
const { uploadFlash } = require("../middlewares/upload");

// Routes publiques
router.get("/", getFlashs);
router.get("/:id", getFlashById);
router.get("/tatoueur/:tatoueurId", getFlashsByTatoueur);

// Routes protégées
router.post("/", authentification, uploadFlash.single('image'), createFlash);
router.put("/:id", authentification, updateFlash);
router.delete("/:id", authentification, deleteFlash);
router.patch("/:id/reserve", authentification, toggleReserve);

module.exports = router;