// Dans user.controllers.js - Ajoutez ces imports en haut
const {
  signup,
  signin,
  updateUser,
  updateAvatar,
  currentUser,
  logoutUser,
  verifyMail,
  forgotMyPassword,
  resetPassword,
  completeProfile,
  changePassword,
  fetchTatoueur,
  fetchTatoueurById,
  getUserById,
  deleteUser,
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowing,
  getFollowers,
  getSuggestedTattooers,
  // ✅ REMPLACEMENT: Fonctions pour contenus sauvegardés au lieu de wishlist
  getSavedPosts,
  getSavedFlashs,
  toggleSavePost,
  toggleSaveFlash,
  checkPostSaved,
  checkFlashSaved,
  getAllSavedContent,
  getUserPreferences,
  updateUserPreferences,
  markRecommendationInteraction,
} = require("../controllers/user.controllers");

const auth = require("../middlewares/auth");
const { uploadAvatar, uploadAvatarToCloudinary } = require("../middlewares/userUpload");

const router = require("express").Router();

// ===== ROUTES D'AUTHENTIFICATION =====
router.post("/", signup);
router.post("/sigin", signin);
router.post("/forgotPassword", forgotMyPassword);
router.post("/resetPassword", resetPassword);
router.post("/changePassword", auth, changePassword);
router.post("/completeProfile", auth, uploadAvatar, uploadAvatarToCloudinary, completeProfile);

// ===== ROUTES DE PROFIL =====
router.put("/", auth, uploadAvatar, uploadAvatarToCloudinary, updateUser);
router.put("/avatar", auth, uploadAvatar, uploadAvatarToCloudinary, updateAvatar);
router.get("/currentUser", auth, currentUser);
router.get("/verifyMail/:token", verifyMail);
router.delete("/deleteToken", auth, logoutUser);
router.delete("/account", auth, deleteUser);

// ===== ROUTES CONTENUS SAUVEGARDÉS (remplace wishlist) =====
router.get("/saved-content", auth, getAllSavedContent);
router.get("/saved-posts", auth, getSavedPosts);
router.get("/saved-flashs", auth, getSavedFlashs);

router.post("/posts/:postId/save", auth, toggleSavePost);
router.post("/flashs/:flashId/save", auth, toggleSaveFlash);

router.get("/posts/:postId/saved", auth, checkPostSaved);
router.get("/flashs/:flashId/saved", auth, checkFlashSaved);

// ===== ROUTES PREFERENCES =====
router.get("/preferences", auth, getUserPreferences);
router.put("/preferences", auth, updateUserPreferences);

// ===== ROUTES RECOMMENDATIONS =====
router.post("/recommendations/interaction", auth, markRecommendationInteraction);

// ===== ROUTES DE SUIVI =====
router.post("/:id/follow", auth, followUser);
router.delete("/:id/unfollow", auth, unfollowUser);
router.get("/:id/is-following", auth, checkIfFollowing);
router.get("/following", auth, getFollowing);
router.get("/followers", auth, getFollowers);
router.get("/:id/followers", getFollowers);

// ===== ROUTES DE DÉCOUVERTE =====
router.get("/tattooers", fetchTatoueur);
router.get("/suggestions/tattooers", auth, getSuggestedTattooers);

// ===== ROUTES SPÉCIFIQUES PAR ID (à placer à la fin) =====
router.get("/user/:id", getUserById);
router.get("/:id/saved-content", getAllSavedContent); // Voir contenu sauvegardé d'un autre user (si public)
router.get("/:id", fetchTatoueurById);

module.exports = router;