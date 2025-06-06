// localhost:3000/api/users

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
} = require("../controllers/user.controllers");
const auth = require("../middlewares/auth");

const router = require("express").Router();

// POST

router.post("/", signup);
router.post("/login", signin);
router.post("/forgotPassword", forgotMyPassword);
router.post("/resetPassword", resetPassword);
router.post("/changePassword", auth,changePassword);
router.post("/completeProfile",auth,completeProfile);

// UPDATE

router.put("/",auth, updateUser);
router.put("/avatar",auth, updateAvatar);

// GET

router.get("/currentUser",auth, currentUser);
router.get("/verifyMail/:token", verifyMail);

// DELETE

router.delete("/deleteToken",auth, logoutUser);

module.exports = router;
