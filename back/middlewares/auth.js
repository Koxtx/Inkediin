// auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authentification = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Accès interdit" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }
};

module.exports = authentification;
