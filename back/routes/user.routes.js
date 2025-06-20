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
} = require("../controllers/user.controllers");

const auth = require("../middlewares/auth");
// ✅ AJOUT: Import du middleware Cloudinary pour User
const { uploadAvatar, uploadAvatarToCloudinary } = require("../middlewares/userUpload");

const router = require("express").Router();

// POST
router.post("/", signup);
router.post("/login", signin);
router.post("/forgotPassword", forgotMyPassword);
router.post("/resetPassword", resetPassword);
router.post("/changePassword", auth, changePassword);

// ✅ AJOUT: Route completeProfile avec upload d'avatar
router.post("/completeProfile", auth, uploadAvatar, uploadAvatarToCloudinary, completeProfile);

// UPDATE
// ✅ MODIFICATION: Route updateUser avec possibilité d'upload d'avatar
router.put("/", auth, uploadAvatar, uploadAvatarToCloudinary, updateUser);

// ✅ MODIFICATION: Route spécifique pour l'avatar
router.put("/avatar", auth, uploadAvatar, uploadAvatarToCloudinary, updateAvatar);

// GET
router.get("/currentUser", auth, currentUser);
router.get("/verifyMail/:token", verifyMail);
router.get("/tattooers", fetchTatoueur);
router.get("/user/:id", getUserById); // ✅ CORRECTION: Préfixe pour éviter conflit
router.get("/:id", fetchTatoueurById); // Spécifique aux tatoueurs

// DELETE
router.delete("/deleteToken", auth, logoutUser);
router.delete("/account", auth, deleteUser); // ✅ AJOUT: Suppression de compte

module.exports = router;