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
const mongoose = require("mongoose");

const SECRET_KEY = process.env.SECRET_KEY;

const createTokenEmail = (email) => {
  return jsonwebtoken.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

const signup = async (req, res) => {
  
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

     

      res.cookie("token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

    

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

   
    if (req.avatarUrl) {
      updateData.photoProfil = req.avatarUrl;
      updateData.cloudinaryAvatarId = req.avatarPublicId;
     
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Erreur updateUser:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// ✅ NOUVEAU: Méthode spécifique pour l'avatar avec Cloudinary
const updateAvatar = async (req, res) => {


  try {
    if (!req.avatarUrl) {
      return res.status(400).json({ message: "Aucun fichier d'avatar fourni" });
    }

    const updateData = {
      photoProfil: req.avatarUrl,
      cloudinaryAvatarId: req.avatarPublicId,
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("❌ Erreur updateAvatar:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'avatar" });
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
 

  res.clearCookie("token", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  
  res.status(200).json({ message: "Déconnexion réussie" });
};

const forgotMyPassword = async (req, res) => {
 
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    

    if (user) {
      const token = createTokenEmail(email);
      

      await sendForgotPasswordEmail(email, token);
      

      const updateResult = await User.updateOne(
        { email },
        {
          resetToken: token,
        }
      );
     

      const updatedUser = await User.findOne({ email });
    
    }
    res.json({ message: "Si un compte est associé, vous recevrez un mail" });
  } catch (error) {
    
  }
};

const resetPassword = async (req, res) => {
 

  const { password, token } = req.body;
  try {
    

    let decodedToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    

    const user = await User.findOne({ resetToken: token });
    

    if (!user) {
     
      return res
        .status(400)
        .json({ message: "Token invalide ou utilisateur introuvable" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

 

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
    console.error("❌ Erreur changePassword:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const completeProfile = async (req, res) => {


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

   
    if (req.avatarUrl) {
      updateData.photoProfil = req.avatarUrl;
      updateData.cloudinaryAvatarId = req.avatarPublicId;
   
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
    console.error("❌ Erreur completeProfile:", error);
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteUser:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du compte" });
  }
};
const followUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

   

    // Vérifier qu'on ne suit pas soi-même
    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({
        message: "Vous ne pouvez pas vous suivre vous-même",
      });
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Vérifier si on suit déjà cet utilisateur
    if (currentUser.isFollowing(targetUserId)) {
      return res.status(400).json({
        message: "Vous suivez déjà cet utilisateur",
      });
    }

    // Utiliser la méthode du modèle pour suivre
    const followResult = currentUser.toggleFollow(targetUserId);
    await currentUser.save();

    // Ajouter l'utilisateur actuel aux tatoueursSuivis de la cible
    if (!targetUser.tatoueursSuivis) targetUser.tatoueursSuivis = [];
    if (!targetUser.tatoueursSuivis.includes(currentUserId)) {
      targetUser.tatoueursSuivis.push(currentUserId);
      await targetUser.save();
    }

    // Récupérer le nombre de followers mis à jour
    const updatedTargetUser = await User.findById(targetUserId);
    const followersCount = updatedTargetUser.tatoueursSuivis
      ? updatedTargetUser.tatoueursSuivis.length
      : 0;

    

    res.status(200).json({
      message: `Vous suivez maintenant ${targetUser.nom}`,
      isFollowing: true,
      followersCount,
    });
  } catch (error) {
    console.error("❌ Erreur followUser:", error);
    res.status(500).json({ message: "Erreur lors du suivi" });
  }
};


const unfollowUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

  

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Vérifier si on suit cet utilisateur
    if (!currentUser.isFollowing(targetUserId)) {
      return res.status(400).json({
        message: "Vous ne suivez pas cet utilisateur",
      });
    }

    // Utiliser la méthode du modèle pour arrêter de suivre
    const unfollowResult = currentUser.toggleFollow(targetUserId);
    await currentUser.save();

    // Retirer l'utilisateur actuel des tatoueursSuivis de la cible
    if (
      targetUser.tatoueursSuivis &&
      targetUser.tatoueursSuivis.includes(currentUserId)
    ) {
      targetUser.tatoueursSuivis = targetUser.tatoueursSuivis.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      await targetUser.save();
    }

    // Récupérer le nombre de followers mis à jour
    const updatedTargetUser = await User.findById(targetUserId);
    const followersCount = updatedTargetUser.tatoueursSuivis
      ? updatedTargetUser.tatoueursSuivis.length
      : 0;

    

    res.status(200).json({
      message: `Vous ne suivez plus ${targetUser.nom}`,
      isFollowing: false,
      followersCount,
    });
  } catch (error) {
    console.error("❌ Erreur unfollowUser:", error);
    res.status(500).json({ message: "Erreur lors de l'arrêt du suivi" });
  }
};


const checkIfFollowing = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

    
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    const isFollowing = currentUser.isFollowing(targetUserId);
    const followersCount = targetUser.tatoueursSuivis
      ? targetUser.tatoueursSuivis.length
      : 0;

    res.status(200).json({
      isFollowing,
      followersCount,
    });
  } catch (error) {
    console.error("❌ Erreur checkIfFollowing:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification",
      isFollowing: false,
    });
  }
};


const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    

    const currentUser = await User.findById(currentUserId)
      .populate(
        "following",
        "nom email photoProfil userType localisation styles bio createdAt"
      )
      .exec();

    if (!currentUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
        following: [],
        count: 0,
      });
    }

    const following = currentUser.following || [];

    

    res.status(200).json({
      following,
      count: following.length,
    });
  } catch (error) {
    console.error("❌ Erreur getFollowing:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération",
      following: [],
      count: 0,
    });
  }
};


const getFollowers = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const userId = targetUserId || req.user._id;

    

    const user = await User.findById(userId)
      .populate(
        "tatoueursSuivis",
        "nom email photoProfil userType localisation styles bio createdAt"
      )
      .exec();

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
        followers: [],
        count: 0,
      });
    }

    const followers = user.tatoueursSuivis || [];

    
    res.status(200).json({
      followers,
      count: followers.length,
    });
  } catch (error) {
    console.error("❌ Erreur getFollowers:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération",
      followers: [],
      count: 0,
    });
  }
};

const getSuggestedTattooers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 10, location, styles } = req.query;

    

    // Récupérer l'utilisateur actuel pour voir qui il suit déjà
    const currentUser = await User.findById(currentUserId);
    const alreadyFollowing = currentUser.following || [];

    // Construire la query de recherche
    let searchQuery = {
      userType: "tatoueur",
      _id: {
        $ne: currentUserId, // Ne pas s'inclure soi-même
        $nin: alreadyFollowing, // Exclure ceux qu'on suit déjà
      },
    };

    // Filtrer par localisation si spécifiée
    if (location) {
      searchQuery.$or = [
        { localisation: { $regex: location, $options: "i" } },
        { ville: { $regex: location, $options: "i" } },
      ];
    }

    // Filtrer par styles si spécifiés
    if (styles) {
      const styleArray = styles.split(",").map((s) => s.trim());
      const styleRegex = styleArray.map((style) => new RegExp(style, "i"));
      searchQuery.styles = { $in: styleRegex };
    }

    // Rechercher les tatoueurs
    const suggestedTattooers = await User.find(searchQuery)
      .select(
        "nom email photoProfil userType localisation ville styles bio createdAt tatoueursSuivis"
      )
      .limit(parseInt(limit))
      .sort({
        // Prioriser ceux avec le plus de followers, puis les plus récents
        tatoueursSuivis: -1,
        createdAt: -1,
      })
      .exec();

    // Enrichir avec des données calculées
    const enrichedTattooers = suggestedTattooers.map((tattooer) => {
      const followersCount = tattooer.tatoueursSuivis
        ? tattooer.tatoueursSuivis.length
        : 0;

      return {
        ...tattooer.toObject(),
        followersCount,
        // Calculer une raison de recommandation simple
        matchReason: getMatchReason(tattooer, currentUser, location, styles),
      };
    });

  

    res.status(200).json({
      suggestions: enrichedTattooers,
      count: enrichedTattooers.length,
      filters: { location, styles, limit },
    });
  } catch (error) {
    console.error("❌ Erreur getSuggestedTattooers:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des suggestions",
      suggestions: [],
      count: 0,
    });
  }
};


const getMatchReason = (
  tattooer,
  currentUser,
  locationFilter,
  stylesFilter
) => {
  const reasons = [];

  // Vérifier la localisation
  if (
    locationFilter &&
    (tattooer.localisation
      ?.toLowerCase()
      .includes(locationFilter.toLowerCase()) ||
      tattooer.ville?.toLowerCase().includes(locationFilter.toLowerCase()))
  ) {
    reasons.push("Dans votre zone");
  } else if (
    currentUser.localisation &&
    tattooer.localisation === currentUser.localisation
  ) {
    reasons.push("Même localisation");
  }

  // Vérifier les styles
  if (stylesFilter && tattooer.styles) {
    const requestedStyles = stylesFilter
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const tattooerStyles = tattooer.styles.toLowerCase();

    const matchingStyles = requestedStyles.filter((style) =>
      tattooerStyles.includes(style)
    );

    if (matchingStyles.length > 0) {
      reasons.push(`Spécialiste ${matchingStyles[0]}`);
    }
  }

  // Vérifier la popularité
  const followersCount = tattooer.tatoueursSuivis
    ? tattooer.tatoueursSuivis.length
    : 0;
  if (followersCount > 50) {
    reasons.push("Très populaire");
  } else if (followersCount > 10) {
    reasons.push("Populaire");
  }

  // Vérifier s'il est nouveau
  const isNew =
    new Date() - new Date(tattooer.createdAt) < 30 * 24 * 60 * 60 * 1000; // 30 jours
  if (isNew) {
    reasons.push("Nouveau sur la plateforme");
  }

  // Retourner la première raison ou une raison par défaut
  return reasons.length > 0 ? reasons[0] : "Recommandé pour vous";
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

   

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur introuvable",
        savedPosts: [],
        count: 0
      });
    }

   
    const savedPostIds = user.savedPosts || [];
    let savedPosts = [];

    if (savedPostIds.length > 0) {
      // Assumant que vous avez un modèle Feed/Post
      try {
        const Feed = require('../models/feed.model'); // Ajustez selon votre structure
        
        // Pagination manuelle
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedIds = savedPostIds.slice(startIndex, endIndex);
        
        savedPosts = await Feed.find({ _id: { $in: paginatedIds } })
          .populate('user', 'nom photoProfil userType')
          .sort({ createdAt: -1 });
      } catch (err) {
       
        savedPosts = savedPostIds.slice(
          (parseInt(page) - 1) * parseInt(limit),
          parseInt(page) * parseInt(limit)
        ).map(id => ({
          _id: id,
          title: "Post sauvegardé",
          description: "Contenu sauvegardé",
          user: { nom: "Utilisateur", photoProfil: null, userType: "tatoueur" }
        }));
      }
    }

  

    res.status(200).json({
      savedPosts,
      count: savedPosts.length,
      totalSaved: savedPostIds.length,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: savedPosts.length === parseInt(limit)
    });

  } catch (error) {
    console.error('❌ Erreur getSavedPosts:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des posts sauvegardés",
      savedPosts: [],
      count: 0
    });
  }
};

// Récupérer les flashs sauvegardés de l'utilisateur
const getSavedFlashs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 12 } = req.query;

  

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur introuvable",
        savedFlashs: [],
        count: 0
      });
    }

   
    const savedFlashIds = user.savedFlashs || [];
    let savedFlashs = [];

    if (savedFlashIds.length > 0) {
      try {
        const Flash = require('../models/flash.model'); // Ajustez selon votre structure
        
        // Pagination manuelle
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedIds = savedFlashIds.slice(startIndex, endIndex);
        
        savedFlashs = await Flash.find({ _id: { $in: paginatedIds } })
          .populate('user', 'nom photoProfil userType localisation')
          .sort({ createdAt: -1 });
      } catch (err) {
       
        savedFlashs = savedFlashIds.slice(
          (parseInt(page) - 1) * parseInt(limit),
          parseInt(page) * parseInt(limit)
        ).map(id => ({
          _id: id,
          title: "Flash sauvegardé",
          style: "Tatouage flash",
          price: 100,
          user: { nom: "Tatoueur", photoProfil: null, userType: "tatoueur", localisation: "France" }
        }));
      }
    }

    

    res.status(200).json({
      savedFlashs,
      count: savedFlashs.length,
      totalSaved: savedFlashIds.length,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: savedFlashs.length === parseInt(limit)
    });

  } catch (error) {
    console.error('❌ Erreur getSavedFlashs:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des flashs sauvegardés",
      savedFlashs: [],
      count: 0
    });
  }
};

const getAllSavedContent = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user?._id;
    const userId = targetUserId || currentUserId;
    
    const { type = 'all', page = 1, limit = 10 } = req.query;

    

    
    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'idTatoueur',
          select: 'nom photoProfil userType'
        }
      })
      .populate({
        path: 'savedFlashs',
        populate: {
          path: 'idTatoueur',
          select: 'nom photoProfil userType localisation'
        }
      });

    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur introuvable",
        content: [],
        count: 0
      });
    }

    let content = [];

   

   
    if (type === 'all' || type === 'posts') {
      const savedPosts = user.savedPosts || [];
      
      
      
      if (savedPosts.length > 0) {
       
        const postsWithType = savedPosts.map(post => ({
          ...post.toObject(),
          contentType: 'post',
          savedAt: post.createdAt || post.datePublication,
          user: post.idTatoueur, 
          title: post.contenu ? post.contenu.substring(0, 100) + '...' : 'Publication'
        }));
        content.push(...postsWithType);
        
   
      }
    }

    
    if (type === 'all' || type === 'flashs') {
      const savedFlashs = user.savedFlashs || [];
      
      
      
      if (savedFlashs.length > 0) {
    

        const flashsWithType = savedFlashs.map(flash => ({
          ...flash.toObject(),
          contentType: 'flash',
          savedAt: flash.createdAt || flash.date,
          user: flash.idTatoueur, 
          price: flash.prix, 
          title: flash.title || flash.description || 'Flash tatouage'
        }));
        content.push(...flashsWithType);
        
      
      }
    }

    // Trier par date de sauvegarde (plus récent en premier)
    content.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedContent = content.slice(startIndex, endIndex);

    const isOwnContent = currentUserId && userId.toString() === currentUserId.toString();

  

    res.status(200).json({
      success: true, 
      content: paginatedContent,
      data: paginatedContent, 
      count: paginatedContent.length,
      totalSaved: content.length,
      isOwnContent,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: endIndex < content.length,
      stats: {
        totalPosts: (user.savedPosts || []).length,
        totalFlashs: (user.savedFlashs || []).length,
        total: (user.savedPosts || []).length + (user.savedFlashs || []).length
      }
    });

  } catch (error) {
    console.error('❌ Erreur getAllSavedContent:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du contenu sauvegardé",
      content: [],
      data: [], 
      count: 0
    });
  }
};

// Sauvegarder/désauvegarder un post
const toggleSavePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;



    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    
    let postExists = true;
    try {
      const Feed = require('../models/feed.model');
      const post = await Feed.findById(postId);
      postExists = !!post;
    } catch (err) {
      console.log('⚠️ Impossible de vérifier l\'existence du post, on continue...');
    }

    if (!postExists) {
      return res.status(404).json({ message: "Publication introuvable" });
    }

    // Utiliser la méthode du modèle
    const result = user.toggleSavePost(postId);
    await user.save();

    

    res.status(200).json({
      message: result.saved ? "Post sauvegardé" : "Post retiré des sauvegardés",
      saved: result.saved,
      action: result.action,
      totalSaved: user.savedPostsCount
    });

  } catch (error) {
    console.error('❌ Erreur toggleSavePost:', error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde du post" });
  }
};

// Sauvegarder/désauvegarder un flash
const toggleSaveFlash = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flashId } = req.params;

   

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    
    let flashExists = true;
    try {
      const Flash = require('../models/flash.model');
      const flash = await Flash.findById(flashId);
      flashExists = !!flash;
    } catch (err) {
      console.log('⚠️ Impossible de vérifier l\'existence du flash, on continue...');
    }

    if (!flashExists) {
      return res.status(404).json({ message: "Flash introuvable" });
    }

    // Utiliser la méthode du modèle
    const result = user.toggleSaveFlash(flashId);
    await user.save();

  
    res.status(200).json({
      message: result.saved ? "Flash sauvegardé" : "Flash retiré des sauvegardés",
      saved: result.saved,
      action: result.action,
      totalSaved: user.savedFlashsCount
    });

  } catch (error) {
    console.error('❌ Erreur toggleSaveFlash:', error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde du flash" });
  }
};

// Vérifier si un post est sauvegardé
const checkPostSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ saved: false });
    }

    const isSaved = user.isPostSaved(postId);

    res.status(200).json({
      saved: isSaved,
      postId
    });

  } catch (error) {
    console.error('❌ Erreur checkPostSaved:', error);
    res.status(500).json({ saved: false });
  }
};

// Vérifier si un flash est sauvegardé
const checkFlashSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flashId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ saved: false });
    }

    const isSaved = user.isFlashSaved(flashId);

    res.status(200).json({
      saved: isSaved,
      flashId
    });

  } catch (error) {
    console.error('❌ Erreur checkFlashSaved:', error);
    res.status(500).json({ saved: false });
  }
};
// ===== PREFERENCES CONTROLLERS =====

const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Préférences par défaut si elles n'existent pas
    const defaultPreferences = {
      preferredStyles: [],
      maxDistance: 50,
      minRating: 4.0,
      priceRange: { min: 0, max: 1000 },
      experienceLevel: "any",
      verifiedOnly: false,
      notifications: {
        newArtists: true,
        priceDrops: true,
        recommendations: true,
      },
    };

    const preferences = user.preferences || defaultPreferences;

    

    res.status(200).json({
      preferences,
      hasCustomPreferences: !!user.preferences,
    });
  } catch (error) {
    console.error("❌ Erreur getUserPreferences:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des préférences",
    });
  }
};

const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const newPreferences = req.body;

    

    // Validation des préférences
    const allowedFields = [
      "preferredStyles",
      "maxDistance",
      "minRating",
      "priceRange",
      "experienceLevel",
      "verifiedOnly",
      "notifications",
    ];

    const validatedPreferences = {};
    allowedFields.forEach((field) => {
      if (newPreferences[field] !== undefined) {
        validatedPreferences[field] = newPreferences[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        preferences: validatedPreferences,
        preferencesUpdatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    

    res.status(200).json({
      message: "Préférences mises à jour",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("❌ Erreur updateUserPreferences:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour des préférences" });
  }
};

// ===== RECOMMENDATIONS CONTROLLERS =====

const markRecommendationInteraction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { artistId, interactionType } = req.body;

    

    // Validation des types d'interaction
    const validInteractions = ["view", "like", "follow", "contact", "dismiss"];
    if (!validInteractions.includes(interactionType)) {
      return res.status(400).json({
        message: "Type d'interaction invalide",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Initialiser le tracking des interactions si nécessaire
    if (!user.recommendationInteractions) {
      user.recommendationInteractions = [];
    }

    // Ajouter l'interaction
    const interaction = {
      artistId,
      interactionType,
      timestamp: new Date(),
      _id: new mongoose.Types.ObjectId(),
    };

    user.recommendationInteractions.push(interaction);

    // Garder seulement les 100 dernières interactions
    if (user.recommendationInteractions.length > 100) {
      user.recommendationInteractions =
        user.recommendationInteractions.slice(-100);
    }

    await user.save();

   

    res.status(200).json({
      message: "Interaction enregistrée",
      interaction,
    });
  } catch (error) {
    console.error("❌ Erreur markRecommendationInteraction:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement de l'interaction" });
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
};