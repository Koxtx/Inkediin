const Flash = require("../models/flash.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Récupérer tous les flashs avec filtres avancés
const getFlashs = async (req, res) => {
  try {
    const {
      disponible,
      tatoueur,
      prixMin,
      prixMax,
      style,
      taille,
      tags,
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    // Construction du filtre
    const filter = {};
    if (disponible !== undefined) filter.disponible = disponible === "true";
    if (tatoueur) filter.idTatoueur = tatoueur;
    if (style) filter.style = style;
    if (taille) filter.taille = taille;

    // Filtrage par prix
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = parseFloat(prixMin);
      if (prixMax) filter.prix.$lte = parseFloat(prixMax);
    }

    // Filtrage par tags
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    const flashs = await Flash.find(filter)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio ville"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const flashsWithCounts = flashs.map((flash) => ({
      ...flash,
      likesCount: flash.likes ? flash.likes.length : 0,
      commentsCount: flash.commentaires ? flash.commentaires.length : 0,
    }));

    const total = await Flash.countDocuments(filter);

    res.status(200).json({
      flashs: flashsWithCounts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getFlashs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un flash par ID avec incrémentation des vues
const getFlashById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    // ✅ AMÉLIORATION: Incrémenter les vues
    const flash = await Flash.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate(
        "idTatoueur",
        "nom photoProfil email localisation styles userType bio ville telephone instagram"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .lean();

    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    const flashWithCounts = {
      ...flash,
      likesCount: flash.likes ? flash.likes.length : 0,
      commentsCount: flash.commentaires ? flash.commentaires.length : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur getFlashById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouveau flash
const createFlash = async (req, res) => {
  try {
    const {
      prix,
      description,
      title,
      artist,
      style,
      styleCustom,
      taille,
      emplacement,
      tags,
    } = req.body;
    const idTatoueur = req.user._id;

    // Vérifier que l'utilisateur est un tatoueur
    const user = await User.findById(idTatoueur);
    if (!user || user.userType !== "tatoueur") {
      return res
        .status(403)
        .json({ error: "Seuls les tatoueurs peuvent créer des Flash" });
    }

    if (!req.imageUrl) {
      return res.status(400).json({ error: "Image requise pour un Flash" });
    }

    if (!prix || isNaN(prix) || prix <= 0) {
      return res.status(400).json({ error: "Prix invalide (doit être > 0)" });
    }

    if (style === "autre" && (!styleCustom || !styleCustom.trim())) {
      return res.status(400).json({
        error: "Le style personnalisé est requis quand 'Autre' est sélectionné",
      });
    }

    if (styleCustom && styleCustom.length > 50) {
      return res.status(400).json({
        error: "Le style personnalisé ne peut pas dépasser 50 caractères",
      });
    }

    // Traitement des tags
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag);
      }
    }

    // Traitement de l'emplacement
    let parsedEmplacement = [];
    if (emplacement) {
      if (typeof emplacement === "string") {
        try {
          parsedEmplacement = JSON.parse(emplacement);
        } catch {
          parsedEmplacement = emplacement
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e);
        }
      } else if (Array.isArray(emplacement)) {
        parsedEmplacement = emplacement;
      }
    }

    const flashData = {
      idTatoueur,
      image: req.imageUrl,
      cloudinaryPublicId: req.imagePublicId,
      prix: parseFloat(prix),
      description: description?.trim() || "",
      title: title?.trim() || "",
      artist: artist?.trim() || "",
      style: style || "autre",
      styleCustom: style === "autre" ? styleCustom?.trim() : undefined,
      taille: taille || "moyen",
      emplacement: parsedEmplacement,
      tags: parsedTags,
      disponible: true,
      reserve: false,
      likes: [],
      views: 0,
      commentaires: [],
    };

    const newFlash = new Flash(flashData);
    const savedFlash = await newFlash.save();

    const populatedFlash = await Flash.findById(savedFlash._id)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .lean();

    const flashWithCounts = {
      ...populatedFlash,
      likesCount: 0,
      commentsCount: 0,
    };

    res.status(201).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur createFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeFlash = async (req, res) => {
  try {
    const flash = await Flash.findById(req.params.id);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || "client";

    // Initialiser likes si undefined
    if (!flash.likes) {
      flash.likes = [];
    }

    const existingLikeIndex = flash.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    let actionTaken = "";
    if (existingLikeIndex !== -1) {
      // Retirer le like
      flash.likes.splice(existingLikeIndex, 1);
      actionTaken = "REMOVED";
    } else {
      // Ajouter le like
      flash.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
      actionTaken = "ADDED";
    }

    // Sauvegarder avec findOneAndUpdate pour éviter les conflits de concurrence
    const updatedFlash = await Flash.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: flash.likes,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

const reserveFlash = async (req, res) => {
  try {
    const flashId = req.params.id;
    const userId = req.user._id;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    if (!flash.disponible) {
      return res.status(400).json({ error: "Flash non disponible" });
    }

    if (flash.reserve) {
      return res.status(400).json({ error: "Flash déjà réservé" });
    }

    if (flash.idTatoueur.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ error: "Impossible de réserver son propre Flash" });
    }

    // Marquer comme réservé
    flash.reserve = true;
    flash.reservedBy = userId;
    flash.reservedAt = new Date();

    await flash.save();

    const updatedFlash = await Flash.findById(flashId)
      .populate("idTatoueur", "nom photoProfil email telephone instagram")
      .populate("reservedBy", "nom photoProfil email telephone")
      .lean();

    res.status(200).json({
      message: "Flash réservé avec succès",
      flash: updatedFlash,
    });
  } catch (error) {
    console.error("❌ Erreur reserveFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un flash (fonction existante améliorée)
const updateFlash = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prix,
      description,
      title,
      artist,
      style,
      styleCustom,
      taille,
      emplacement,
      tags,
      disponible,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const updateData = {};
    if (prix !== undefined) {
      if (isNaN(prix) || prix <= 0) {
        return res.status(400).json({ error: "Prix invalide" });
      }
      updateData.prix = parseFloat(prix);
    }
    if (description !== undefined) updateData.description = description.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (artist !== undefined) updateData.artist = artist.trim();

    if (style !== undefined) {
      updateData.style = style;

      // Si on passe à "autre", on peut ajouter un styleCustom
      if (style === "autre" && styleCustom !== undefined) {
        if (!styleCustom.trim()) {
          return res.status(400).json({
            error:
              "Le style personnalisé est requis quand 'Autre' est sélectionné",
          });
        }
        if (styleCustom.length > 50) {
          return res.status(400).json({
            error: "Le style personnalisé ne peut pas dépasser 50 caractères",
          });
        }
        updateData.styleCustom = styleCustom.trim();
      } else if (style !== "autre") {
        // Si on change pour un style prédéfini, supprimer le styleCustom
        updateData.styleCustom = undefined;
      }
    } else if (styleCustom !== undefined) {
      // Si on modifie seulement le styleCustom
      if (flash.style === "autre") {
        if (!styleCustom.trim()) {
          return res.status(400).json({
            error: "Le style personnalisé ne peut pas être vide",
          });
        }
        if (styleCustom.length > 50) {
          return res.status(400).json({
            error: "Le style personnalisé ne peut pas dépasser 50 caractères",
          });
        }
        updateData.styleCustom = styleCustom.trim();
      }
    }

    if (taille !== undefined) updateData.taille = taille;
    if (disponible !== undefined) updateData.disponible = disponible;

    // Gestion des tags
    if (tags !== undefined) {
      let parsedTags = [];
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag);
      }
      updateData.tags = parsedTags;
    }

    // Gestion de l'emplacement
    if (emplacement !== undefined) {
      let parsedEmplacement = [];
      if (typeof emplacement === "string") {
        try {
          parsedEmplacement = JSON.parse(emplacement);
        } catch {
          parsedEmplacement = emplacement
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e);
        }
      } else if (Array.isArray(emplacement)) {
        parsedEmplacement = emplacement;
      }
      updateData.emplacement = parsedEmplacement;
    }

    // Mise à jour de l'image si nouvelle image uploadée
    if (req.imageUrl) {
      updateData.image = req.imageUrl;
      updateData.cloudinaryPublicId = req.imagePublicId;
    }

    const updatedFlash = await Flash.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur updateFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un flash (fonction existante)
const deleteFlash = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    await Flash.findByIdAndDelete(id);

    res.status(200).json({ message: "Flash supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les flashs d'un tatoueur (fonction existante améliorée)
const getFlashsByTatoueur = async (req, res) => {
  try {
    const { tatoueurId } = req.params;
    const { disponible, page = 1, limit = 12 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(tatoueurId)) {
      return res.status(400).json({ error: "ID tatoueur invalide" });
    }

    const filter = { idTatoueur: tatoueurId };
    if (disponible !== undefined) filter.disponible = disponible === "true";

    const flashs = await Flash.find(filter)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const flashsWithCounts = flashs.map((flash) => ({
      ...flash,
      likesCount: flash.likes ? flash.likes.length : 0,
      commentsCount: flash.commentaires ? flash.commentaires.length : 0,
    }));

    const total = await Flash.countDocuments(filter);

    res.status(200).json({
      flashs: flashsWithCounts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("❌ Erreur getFlashsByTatoueur:", error);
    res.status(500).json({ error: error.message });
  }
};

// Basculer le statut de réservation (fonction existante)
const toggleReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const flash = await Flash.findById(id);
    if (!flash) {
      return res.status(404).json({ error: "Flash non trouvé" });
    }

    // Seul le propriétaire peut modifier le statut
    if (flash.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    flash.reserve = !flash.reserve;

    // Si on annule la réservation, supprimer les infos de réservation
    if (!flash.reserve) {
      flash.reservedBy = undefined;
      flash.reservedAt = undefined;
    }

    await flash.save();

    const updatedFlash = await Flash.findById(id)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur toggleReserve:", error);
    res.status(500).json({ error: error.message });
  }
};

const saveFlash = async (req, res) => {
  try {
    const flashId = req.params.id;
    const userId = req.user._id;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const user = await User.findById(userId);
    if (!user.savedFlashs) user.savedFlashs = [];

    if (user.savedFlashs.includes(flashId)) {
      return res.status(400).json({
        message: "Flash déjà sauvegardé",
        saved: true,
      });
    }

    user.savedFlashs.push(flashId);
    await user.save();

    console.log("✅ Flash sauvegardé:", flashId);
    res.status(200).json({
      message: "Flash sauvegardé avec succès",
      saved: true,
    });
  } catch (error) {
    console.error("❌ Erreur saveFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

const unsaveFlash = async (req, res) => {
  try {
    const flashId = req.params.id;
    const userId = req.user._id;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const user = await User.findById(userId);
    if (!user.savedFlashs) user.savedFlashs = [];

    if (!user.savedFlashs.includes(flashId)) {
      return res.status(400).json({
        message: "Flash non présent dans les favoris",
        saved: false,
      });
    }

    user.savedFlashs = user.savedFlashs.filter(
      (id) => id.toString() !== flashId
    );
    await user.save();

    console.log("✅ Flash retiré des favoris:", flashId);
    res.status(200).json({
      message: "Flash retiré des favoris avec succès",
      saved: false,
    });
  } catch (error) {
    console.error("❌ Erreur unsaveFlash:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSavedFlashs = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId).populate({
      path: "savedFlashs",
      populate: [
        {
          path: "idTatoueur",
          select: "nom photoProfil localisation styles userType bio ville",
        },
        {
          path: "likes.userId",
          select: "nom photoProfil userType",
        },
        {
          path: "commentaires.userId",
          select: "nom photoProfil userType",
        },
        {
          path: "commentaires.replies.userId",
          select: "nom photoProfil userType",
        },
        {
          path: "commentaires.likes.userId",
          select: "nom photoProfil userType",
        },
        {
          path: "commentaires.replies.likes.userId",
          select: "nom photoProfil userType",
        },
      ],
      options: {
        sort: { date: -1 },
        limit: limit * 1,
        skip: (page - 1) * limit,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const savedFlashs = user.savedFlashs || [];

    const savedFlashsWithCounts = savedFlashs.map((flash) => ({
      ...flash.toObject(),
      likesCount: flash.likes ? flash.likes.length : 0,
      commentsCount: flash.commentaires ? flash.commentaires.length : 0,
    }));

    const totalSaved = await User.aggregate([
      { $match: { _id: userId } },
      { $project: { count: { $size: "$savedFlashs" } } },
    ]);

    const total = totalSaved[0]?.count || 0;

    res.status(200).json({
      flashs: savedFlashsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        total,
      },
    });
  } catch (error) {
    console.error("❌ Erreur getSavedFlashs:", error);
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const flash = await Flash.findById(req.params.id);

    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    if (!contenu || contenu.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Le contenu du commentaire est requis" });
    }

    if (contenu.trim().length > 1000) {
      return res.status(400).json({
        message: "Le commentaire ne peut pas dépasser 1000 caractères",
      });
    }

    const newComment = {
      userId: req.user._id,
      userType: req.user.userType || "client",
      contenu: contenu.trim(),
      dateCommentaire: new Date(),
      likes: [],
      replies: [],
    };

    flash.commentaires.push(newComment);
    await flash.save();

    const updatedFlash = await Flash.findById(flash._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(201).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur addComment Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const flash = await Flash.findById(req.params.id);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const comment = flash.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Vérifier les permissions (propriétaire du commentaire ou du Flash)
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      flash.idTatoueur.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    flash.commentaires.pull(req.params.commentId);
    await flash.save();

    res.status(200).json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("❌ Erreur deleteComment Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeComment = async (req, res) => {
  try {
    const flash = await Flash.findById(req.params.id);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const comment = flash.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || "client";

    // Initialiser likes si undefined
    if (!comment.likes) {
      comment.likes = [];
    }

    const existingLikeIndex = comment.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    if (existingLikeIndex !== -1) {
      // Retirer le like
      comment.likes.splice(existingLikeIndex, 1);
    } else {
      // Ajouter le like
      comment.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
    }

    // Marquer comme modifié et sauvegarder
    comment.markModified("likes");
    flash.markModified("commentaires");
    await flash.save();

    // Retourner le flash complet avec populate
    const updatedFlash = await Flash.findById(flash._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeComment Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

const addReplyToComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const { id: flashId, commentId } = req.params;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const comment = flash.commentaires.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    if (!contenu || contenu.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Le contenu de la réponse est requis" });
    }

    if (contenu.trim().length > 500) {
      return res
        .status(400)
        .json({ message: "La réponse ne peut pas dépasser 500 caractères" });
    }

    // Initialiser replies si nécessaire
    if (!comment.replies) {
      comment.replies = [];
    }

    const newReply = {
      userId: req.user._id,
      userType: req.user.userType || "client",
      contenu: contenu.trim(),
      dateReponse: new Date(),
      likes: [],
    };

    comment.replies.push(newReply);
    await flash.save();

    // Retourner le flash mis à jour avec populate
    const updatedFlash = await Flash.findById(flash._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(201).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur addReplyToComment Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeReply = async (req, res) => {
  try {
    const { id: flashId, commentId, replyId } = req.params;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const comment = flash.commentaires.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || "client";

    if (!reply.likes) reply.likes = [];

    const existingLike = reply.likes.find(
      (like) => like.userId.toString() === userId.toString()
    );

    if (existingLike) {
      // Retirer le like
      reply.likes = reply.likes.filter(
        (like) => like.userId.toString() !== userId.toString()
      );
    } else {
      // Ajouter le like
      reply.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
    }

    await flash.save();

    // Retourner le flash mis à jour
    const updatedFlash = await Flash.findById(flash._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    const flashWithCounts = {
      ...updatedFlash,
      likesCount: updatedFlash.likes ? updatedFlash.likes.length : 0,
      commentsCount: updatedFlash.commentaires
        ? updatedFlash.commentaires.length
        : 0,
    };

    res.status(200).json(flashWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeReply Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { id: flashId, commentId, replyId } = req.params;

    const flash = await Flash.findById(flashId);
    if (!flash) {
      return res.status(404).json({ message: "Flash non trouvé" });
    }

    const comment = flash.commentaires.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réponse ou du Flash
    if (
      reply.userId.toString() !== req.user._id.toString() &&
      flash.idTatoueur.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    comment.replies.pull(replyId);
    await flash.save();

    res.status(200).json({ message: "Réponse supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteReply Flash:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
  unsaveFlash,
};
