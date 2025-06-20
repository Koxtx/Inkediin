const Feed = require("../models/feed.model");
const User = require("../models/user.model");

const getFeeds = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "datePublication",
      order = "desc",
      tatoueurId,
      tags,
    } = req.query;

    const query = {};
    if (tatoueurId) query.idTatoueur = tatoueurId;
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const feeds = await Feed.find(query)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map((feed) => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    }));

    const total = await Feed.countDocuments(query);

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getFeeds:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFollowedFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let followedArtists = [];

    if (user.userType === "client") {
      followedArtists = user.tatoueursSuivis || [];
    } else if (user.userType === "tatoueur") {
      followedArtists = user.following || [];
    }

    if (followedArtists.length === 0) {
      return res.status(200).json({
        publications: [],
        totalPages: 0,
        currentPage: parseInt(page),
        total: 0,
        limit: parseInt(limit),
      });
    }

    const feeds = await Feed.find({ idTatoueur: { $in: followedArtists } })
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map((feed) => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    }));

    const total = await Feed.countDocuments({
      idTatoueur: { $in: followedArtists },
    });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getFollowedFeeds:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRecommendedFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feeds = await Feed.find({})
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .sort({
        datePublication: -1,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map((feed) => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    }));

    const total = await Feed.countDocuments({});

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getRecommendedFeeds:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFeedsByTattooArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const feeds = await Feed.find({ idTatoueur: artistId })
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map((feed) => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    }));

    const total = await Feed.countDocuments({ idTatoueur: artistId });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getFeedsByTattooArtist:", error);
    res.status(500).json({ error: error.message });
  }
};

const searchFeedsByTag = async (req, res) => {
  try {
    const { tag, page = 1, limit = 10 } = req.query;

    if (!tag) {
      return res.status(400).json({ message: "Le paramètre 'tag' est requis" });
    }

    const feeds = await Feed.find({
      tags: { $regex: new RegExp(tag, "i") },
    })
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map((feed) => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    }));

    const total = await Feed.countDocuments({
      tags: { $regex: new RegExp(tag, "i") },
    });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur searchFeedsByTag:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFeedById = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id)
      .populate(
        "idTatoueur",
        "nom photoProfil email localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .lean();

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const feedWithCounts = {
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0,
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur getFeedById:", error);
    res.status(500).json({ error: error.message });
  }
};

const createFeed = async (req, res) => {
  try {
    const { contenu, tags } = req.body;
    const idTatoueur = req.user._id;

    console.log("📝 createFeed - Données reçues:", {
      contenu,
      tags,
      idTatoueur,
      hasFile: !!req.file,
      imageUrl: req.imageUrl,
      imagePublicId: req.imagePublicId,
    });

    const user = await User.findById(idTatoueur);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.userType !== "tatoueur") {
      return res.status(403).json({
        message: "Seuls les tatoueurs peuvent créer des publications",
      });
    }

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: "Le contenu est requis" });
    }

    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const hashtagRegex = /#\w+/g;
    const contentHashtags = contenu ? contenu.match(hashtagRegex) || [] : [];
    const extractedTags = contentHashtags.map((tag) =>
      tag.substring(1).toLowerCase()
    );

    const allTags = [...new Set([...parsedTags, ...extractedTags])];

    const feedData = {
      idTatoueur,
      contenu: contenu.trim(),
      tags: allTags,
      image: req.imageUrl || null,
      cloudinaryPublicId: req.imagePublicId || null,
      datePublication: new Date(),
    };

    console.log("📝 createFeed - Données à sauvegarder:", feedData);

    const feed = new Feed(feedData);
    await feed.save();

    const populatedFeed = await Feed.findById(feed._id)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .lean();

    const feedWithCounts = {
      ...populatedFeed,
      likesCount: 0,
      commentsCount: 0,
    };

    console.log("✅ createFeed - Publication créée:", feedWithCounts);
    res.status(201).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur createFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateFeed = async (req, res) => {
  try {
    const { contenu, tags } = req.body;
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.contenu = contenu;

    if (tags) {
      let parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);

      const hashtagRegex = /#\w+/g;
      const contentHashtags = contenu ? contenu.match(hashtagRegex) || [] : [];
      const extractedTags = contentHashtags.map((tag) =>
        tag.substring(1).toLowerCase()
      );

      feed.tags = [...new Set([...parsedTags, ...extractedTags])];
    }

    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate(
        "idTatoueur",
        "nom photoProfil localisation styles userType bio"
      )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur updateFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await Feed.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Publication supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeFeed = async (req, res) => {
  try {
    console.log("👍 likeFeed - Début:", {
      feedId: req.params.id,
      userId: req.user._id,
      userType: req.user.userType,
    });

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || "client";

    console.log("📝 Publication trouvée:", {
      feedId: feed._id,
      likesActuels: feed.likes?.length || 0,
      likesArray: feed.likes,
    });

    // ✅ CORRECTION: Initialiser likes si undefined
    if (!feed.likes) {
      feed.likes = [];
      console.log("🔧 Initialisation array likes publication");
    }

    // ✅ CORRECTION: Chercher le like avec toString() pour éviter les problèmes d'ObjectId
    const existingLikeIndex = feed.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    console.log("🔍 Like existant index:", existingLikeIndex);
    console.log("🔍 Détail recherche like:", {
      userId: userId.toString(),
      likesUserIds: feed.likes.map((like) => like.userId.toString()),
    });

    let actionTaken = "";
    if (existingLikeIndex !== -1) {
      // Retirer le like
      feed.likes.splice(existingLikeIndex, 1);
      actionTaken = "REMOVED";
      console.log("➖ Like retiré de la publication");
    } else {
      // Ajouter le like
      feed.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
      actionTaken = "ADDED";
      console.log("➕ Like ajouté à la publication");
    }

    console.log("💾 Nouveaux likes publication après modification:", {
      count: feed.likes.length,
      action: actionTaken,
      likesArray: feed.likes,
    });

    // ✅ CORRECTION MAJEURE: Utiliser findOneAndUpdate pour éviter les problèmes de concurrence
    const updatedFeed = await Feed.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: feed.likes,
        updatedAt: new Date(),
      },
      {
        new: true, // Retourner le document mis à jour
        runValidators: true,
      }
    )
      .populate("likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .lean();

    if (!updatedFeed) {
      console.error("❌ Feed non trouvé après mise à jour");
      return res
        .status(404)
        .json({ message: "Publication non trouvée après mise à jour" });
    }

    console.log("✅ Publication mise à jour avec findOneAndUpdate");
    console.log("🔍 Vérification finale:", {
      feedId: updatedFeed._id,
      finalLikesCount: updatedFeed.likes?.length || 0,
      finalLikesArray: updatedFeed.likes,
      userStillInLikes: updatedFeed.likes?.some(
        (like) =>
          (like.userId._id || like.userId).toString() === userId.toString()
      ),
    });

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    console.log("🎉 likeFeed - Succès final:", {
      finalLikes: feedWithCounts.likesCount,
      action: actionTaken,
      success: true,
    });

    res.status(200).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSavedFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "savedPosts",
      populate: [
        {
          path: "idTatoueur",
          select: "nom photoProfil localisation styles userType bio",
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
          path: "commentaires.replies.userId", // ✅ AJOUT
          select: "nom photoProfil userType",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const savedPosts = user.savedPosts || [];
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = savedPosts.slice(startIndex, endIndex);

    const postsWithCounts = paginatedPosts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.commentaires ? post.commentaires.length : 0,
    }));

    res.status(200).json({
      publications: postsWithCounts,
      totalPages: Math.ceil(savedPosts.length / limit),
      currentPage: parseInt(page),
      total: savedPosts.length,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("❌ Erreur getSavedFeeds:", error);
    res.status(500).json({ error: error.message });
  }
};

const saveFeed = async (req, res) => {
  try {
    const feedId = req.params.id;
    const userId = req.user._id;

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const user = await User.findById(userId);
    if (!user.savedPosts) user.savedPosts = [];

    if (!user.savedPosts.includes(feedId)) {
      user.savedPosts.push(feedId);
      await user.save();
      res.status(200).json({ message: "Publication sauvegardée", saved: true });
    } else {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== feedId
      );
      await user.save();
      res
        .status(200)
        .json({ message: "Publication retirée des favoris", saved: false });
    }
  } catch (error) {
    console.error("❌ Erreur saveFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const unsaveFeed = async (req, res) => {
  try {
    const feedId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.savedPosts) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== feedId
      );
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Publication retirée des favoris", saved: false });
  } catch (error) {
    console.error("❌ Erreur unsaveFeed:", error);
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const newComment = {
      userId: req.user._id,
      userType: req.user.userType || "client",
      contenu,
      dateCommentaire: new Date(),
      likes: [],
      replies: [], // ✅ AJOUT: Initialiser replies
    };

    feed.commentaires.push(newComment);
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType") // ✅ AJOUT
      .populate("idTatoueur", "nom photoProfil userType")
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    res.status(201).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur addComment:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    if (
      comment.userId.toString() !== req.user._id.toString() &&
      feed.idTatoueur.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.commentaires.pull(req.params.commentId);
    await feed.save();

    res.status(200).json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("❌ Erreur deleteComment:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeComment = async (req, res) => {
  try {
    console.log("👍 likeComment - Début:", {
      feedId: req.params.id,
      commentId: req.params.commentId,
      userId: req.user._id,
      userType: req.user.userType,
    });

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || "client";

    console.log("📝 Commentaire trouvé:", {
      commentId: comment._id,
      likesActuels: comment.likes?.length || 0,
      likesArray: comment.likes,
    });

    // ✅ CORRECTION: Initialiser likes si undefined
    if (!comment.likes) {
      comment.likes = [];
      console.log("🔧 Initialisation array likes");
    }

    const existingLikeIndex = comment.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    console.log("🔍 Like existant index:", existingLikeIndex);

    if (existingLikeIndex !== -1) {
      // Retirer le like
      comment.likes.splice(existingLikeIndex, 1);
      console.log("➖ Like retiré");
    } else {
      // Ajouter le like
      comment.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
      console.log("➕ Like ajouté");
    }

    console.log("💾 Nouveaux likes:", comment.likes.length);

    // ✅ CORRECTION: Marquer le commentaire comme modifié
    comment.markModified("likes");
    feed.markModified("commentaires");

    await feed.save();

    console.log("✅ Feed sauvegardé");

    // ✅ CORRECTION: Retourner le feed complet avec populate
    const updatedFeed = await Feed.findById(feed._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .populate("likes.userId", "nom photoProfil userType")
      .lean();

    if (!updatedFeed) {
      return res
        .status(404)
        .json({ message: "Publication non trouvée après mise à jour" });
    }

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    console.log("🎉 likeComment - Succès:", {
      commentLikes:
        feedWithCounts.commentaires.find(
          (c) => c._id.toString() === req.params.commentId
        )?.likes?.length || 0,
    });

    res.status(200).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeComment:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ NOUVELLES FONCTIONS: Gestion des réponses aux commentaires

const addReplyToComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const { id: feedId, commentId } = req.params;

    console.log("📝 addReplyToComment:", { feedId, commentId, contenu });

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    if (!contenu || contenu.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Le contenu de la réponse est requis" });
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
    await feed.save();

    console.log("✅ Réponse ajoutée avec succès");

    // Retourner le feed mis à jour avec populate
    const updatedFeed = await Feed.findById(feed._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    res.status(201).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur addReplyToComment:", error);
    res.status(500).json({ error: error.message });
  }
};

const likeReply = async (req, res) => {
  try {
    const { id: feedId, commentId, replyId } = req.params;

    console.log("👍 likeReply:", { feedId, commentId, replyId });

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(commentId);
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
      console.log("➖ Like retiré de la réponse");
    } else {
      // Ajouter le like
      reply.likes.push({
        userId,
        userType,
        dateLike: new Date(),
      });
      console.log("➕ Like ajouté à la réponse");
    }

    await feed.save();

    // Retourner le feed mis à jour
    const updatedFeed = await Feed.findById(feed._id)
      .populate("commentaires.userId", "nom photoProfil userType")
      .populate("commentaires.replies.userId", "nom photoProfil userType")
      .populate("commentaires.likes.userId", "nom photoProfil userType")
      .populate("commentaires.replies.likes.userId", "nom photoProfil userType")
      .populate("idTatoueur", "nom photoProfil userType")
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires
        ? updatedFeed.commentaires.length
        : 0,
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    console.error("❌ Erreur likeReply:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { id: feedId, commentId, replyId } = req.params;

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réponse ou de la publication
    if (
      reply.userId.toString() !== req.user._id.toString() &&
      feed.idTatoueur.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    comment.replies.pull(replyId);
    await feed.save();

    res.status(200).json({ message: "Réponse supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteReply:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFeeds,
  getFeedById,
  createFeed,
  updateFeed,
  deleteFeed,
  likeFeed,
  addComment,
  deleteComment,
  likeComment,
  getFollowedFeeds,
  getRecommendedFeeds,
  getFeedsByTattooArtist,
  getSavedFeeds,
  saveFeed,
  unsaveFeed,
  searchFeedsByTag,
  // ✅ AJOUT: Nouvelles fonctions
  addReplyToComment,
  likeReply,
  deleteReply,
};
