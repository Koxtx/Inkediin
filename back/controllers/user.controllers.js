const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const {
  sendConfirmationEmail,
  sendValidationAccount,
  sendInvalidEmailToken,
  sendForgotPasswordEmail,
  validateNewPassword,
} = require("../email/email");
const TempUser = require("../models/tempuser.model");
const { deleteAvatarFromCloudinary } = require("../middlewares/userUpload");

const SECRET_KEY = process.env.SECRET_KEY;

const createTokenEmail = (email) => {
  return jsonwebtoken.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

const signup = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Déjà inscrit" });
    }
    const token = createTokenEmail(email);
    await sendConfirmationEmail(email, token);
    const tempUser = new TempUser({
      email,
      password: await bcrypt.hash(password, 10),
      token,
    });
    await tempUser.save();
    res.status(201).json({
      message:
        "Veulliez confirmer votre en inscription en consultant votre boite mail",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyMail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    const tempUser = await TempUser.findOne({ email: decoded.email, token });
    if (!tempUser) {
      return res.redirect(`${process.env.CLIENT_URL}/register?message=error`);
    }
    const newUser = new User({
      email: tempUser.email,
      password: tempUser.password,
    });
    await newUser.save();
    await TempUser.deleteOne({ email: tempUser.email });
    await sendValidationAccount(tempUser.email);
    res.redirect(`${process.env.CLIENT_URL}/login?message=success`);
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      const tempUser = await TempUser.findOne({ token });
      if (tempUser) {
        await tempUser.deleteOne({ token });
        await sendInvalidEmailToken(tempUser.email);
      }
      return res.redirect(`${process.env.CLIENT_URL}/register?message=error`);
    }
    console.log(error);
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email et/ou mot de passe incorrect" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const { password: _, ...userWithoutPassword } = user.toObject();
      const token = jsonwebtoken.sign({}, SECRET_KEY, {
        subject: user._id.toString(),
        expiresIn: "7d",
        algorithm: "HS256",
      });

      console.log('🔐 Token créé pour:', user.nom);
      console.log('🎫 Token:', token.substring(0, 20) + '...');

      res.cookie("token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      console.log('🍪 Cookie défini avec les options:');
      console.log('- httpOnly: false (accessible via JS pour WebSocket)');
      console.log('- secure:', process.env.NODE_ENV === 'production');
      console.log('- sameSite: lax');
      console.log('- maxAge: 7 jours');

      res.status(200).json({
        ...userWithoutPassword,
        needsProfileCompletion: !user.isProfileCompleted || !user.userType,
      });
    } else {
      res.status(400).json({ message: "Email et/ou mot de passe incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateUser = async (req, res) => {
  console.log('📝 UpdateUser - Body reçu:', req.body);
  console.log('📝 UpdateUser - Fichier reçu:', !!req.file);
  
  try {
    const {
      email,
      nom,
      userType,
      localisation,
      bio,
      styles,
      portfolio,
      followers,
    } = req.body;

    const updateData = {
      email,
      nom,
      userType,
      localisation,
      bio,
      styles,
      portfolio,
      followers,
    };

    // ✅ AJOUT: Si un avatar a été uploadé via Cloudinary
    if (req.avatarUrl) {
      updateData.photoProfil = req.avatarUrl;
      updateData.cloudinaryAvatarId = req.avatarPublicId;
      console.log('👤 Avatar Cloudinary ajouté:', {
        url: req.avatarUrl,
        publicId: req.avatarPublicId
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('✅ Utilisateur mis à jour:', updatedUser.nom);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('❌ Erreur updateUser:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// ✅ NOUVEAU: Méthode spécifique pour l'avatar avec Cloudinary
const updateAvatar = async (req, res) => {
  console.log('🖼️ UpdateAvatar - Fichier reçu:', !!req.file);
  console.log('🖼️ UpdateAvatar - Avatar URL:', req.avatarUrl);
  
  try {
    if (!req.avatarUrl) {
      return res.status(400).json({ message: "Aucun fichier d'avatar fourni" });
    }

    const updateData = {
      photoProfil: req.avatarUrl,
      cloudinaryAvatarId: req.avatarPublicId
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('✅ Avatar mis à jour pour:', updatedUser.nom);
    
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Erreur updateAvatar:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'avatar" });
  }
};

const currentUser = async (req, res) => {
  try {
    res.status(200).json(req.user || null);
  } catch (error) {
    res.status(400).json(null);
  }
};

const logoutUser = async (req, res) => {
  console.log('👋 Déconnexion utilisateur');
  
  res.clearCookie("token", {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  console.log('🍪 Cookie token supprimé');
  res.status(200).json({ message: "Déconnexion réussie" });
};

const forgotMyPassword = async (req, res) => {
  console.log("📧 ForgotPassword - Body reçu:", req.body);
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(
      "👤 Utilisateur trouvé pour forgot password:",
      user ? "OUI" : "NON"
    );

    if (user) {
      const token = createTokenEmail(email);
      console.log("🔑 Token généré:", token);

      await sendForgotPasswordEmail(email, token);
      console.log("📧 Email envoyé");

      const updateResult = await User.updateOne(
        { email },
        {
          resetToken: token,
        }
      );
      console.log("💾 Résultat de la mise à jour:", updateResult);

      const updatedUser = await User.findOne({ email });
      console.log("🔍 Token sauvegardé en base:", updatedUser.resetToken);
    }
    res.json({ message: "Si un compte est associé, vous recevrez un mail" });
  } catch (error) {
    console.log("❌ Erreur dans forgotMyPassword:", error);
  }
};

const resetPassword = async (req, res) => {
  console.log("🔐 Reset password - Body reçu:", req.body);

  const { password, token } = req.body;
  try {
    console.log("🔍 Vérification du token:", token);

    let decodedToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    console.log("✅ Token décodé:", decodedToken);

    const user = await User.findOne({ resetToken: token });
    console.log("👤 Utilisateur trouvé:", user ? "OUI" : "NON");

    if (!user) {
      console.log("❌ Aucun utilisateur avec ce token");
      return res
        .status(400)
        .json({ message: "Token invalide ou utilisateur introuvable" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    console.log("✅ Mot de passe mis à jour avec succès");

    await validateNewPassword(user.email);

    res.status(200).json({ messageOk: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.log("❌ Erreur dans resetPassword:", error.message);
    res.status(400).json({ message: "Jeton d'authentification invalide" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, req.user.password);
    if (isSameAsOld) {
      return res.status(401).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();

    await validateNewPassword(req.user.email);
    return res
      .status(200)
      .json({ messageOk: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const completeProfile = async (req, res) => {
  console.log('📝 CompleteProfile - Body reçu:', req.body);
  console.log('📝 CompleteProfile - Fichier reçu:', !!req.file);
  
  try {
    const { userType, nom, localisation, bio, styles, portfolio } = req.body;

    if (!userType || !["client", "tatoueur"].includes(userType)) {
      return res
        .status(400)
        .json({ message: "Type d'utilisateur requis (client ou tatoueur)" });
    }

    if (!nom || !localisation) {
      return res
        .status(400)
        .json({ message: "Nom et localisation sont requis" });
    }

    const updateData = {
      userType,
      nom,
      localisation,
      isProfileCompleted: true,
    };

    // ✅ AJOUT: Si un avatar a été uploadé via Cloudinary
    if (req.avatarUrl) {
      updateData.photoProfil = req.avatarUrl;
      updateData.cloudinaryAvatarId = req.avatarPublicId;
      console.log('👤 Avatar Cloudinary ajouté lors de la complétion:', {
        url: req.avatarUrl,
        publicId: req.avatarPublicId
      });
    }

    if (userType === "tatoueur") {
      if (bio) updateData.bio = bio;
      if (styles) updateData.styles = styles;
      if (portfolio) updateData.portfolio = portfolio;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json({
      ...userWithoutPassword,
      message: "Profil complété avec succès",
    });
  } catch (error) {
    console.error('❌ Erreur completeProfile:', error);
    res.status(500).json({ message: "Erreur lors de la complétion du profil" });
  }
};

const fetchTatoueur = async (req, res) => {
  try {
    const tattooers = await User.find({
      userType: "tatoueur",
    }).select(
      "nom localisation styles photoProfil portfolio bio followers createdAt"
    );

    res.json(tattooers);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const fetchTatoueurById = async (req, res) => {
  const { id } = req.params;
  try {
    const tatoueur = await User.findOne({
      _id: id,
      userType: "tatoueur",
    }).select(
      "nom localisation styles photoProfil portfolio bio followers createdAt email userType"
    );

    if (!tatoueur) {
      return res.status(404).json({ message: "Tatoueur non trouvé" });
    }

    res.json(tatoueur);
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      _id: id,
    }).select(
      "nom localisation styles photoProfil portfolio bio followers createdAt email userType"
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ NOUVEAU: Fonction pour supprimer un utilisateur et son avatar
const deleteUser = async (req, res) => {
  try {
    const user = req.user;

    // Supprimer l'avatar de Cloudinary s'il existe
    if (user.cloudinaryAvatarId) {
      await deleteAvatarFromCloudinary(user.cloudinaryAvatarId);
    }

    // Supprimer l'utilisateur de la base de données
    await User.findByIdAndDelete(user._id);

    // Supprimer le cookie
    res.clearCookie("token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error);
    res.status(500).json({ message: "Erreur lors de la suppression du compte" });
  }
};

module.exports = {
  signup,
  signin,
  updateUser,
  updateAvatar,
  currentUser,
  logoutUser,
  verifyMail,
  forgotMyPassword,
  resetPassword,
  changePassword,
  completeProfile,
  fetchTatoueur,
  fetchTatoueurById,
  getUserById,
  deleteUser,
};