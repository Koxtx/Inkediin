const Feed = require("../models/feed.model");
const User = require("../models/user.model");

const getFeeds = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'datePublication',
      order = 'desc',
      tatoueurId,
      tags 
    } = req.query;

    const query = {};
    if (tatoueurId) query.idTatoueur = tatoueurId;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const feeds = await Feed.find(query)
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Ajouter le compteur de likes à chaque feed
    const feedsWithCounts = feeds.map(feed => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    }));

    const total = await Feed.countDocuments(query);

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
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
    
    if (user.userType === 'client') {
      followedArtists = user.tatoueursSuivis || [];
    } else if (user.userType === 'tatoueur') {
      followedArtists = user.following || [];
    }

    if (followedArtists.length === 0) {
      return res.status(200).json({
        publications: [],
        totalPages: 0,
        currentPage: parseInt(page),
        total: 0,
        limit: parseInt(limit)
      });
    }

    const feeds = await Feed.find({ idTatoueur: { $in: followedArtists } })
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map(feed => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    }));

    const total = await Feed.countDocuments({ idTatoueur: { $in: followedArtists } });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendedFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const feeds = await Feed.find({})
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .sort({ 
        likesCount: -1,
        datePublication: -1 
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map(feed => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    }));

    const total = await Feed.countDocuments({});

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeedsByTattooArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const feeds = await Feed.find({ idTatoueur: artistId })
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map(feed => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    }));

    const total = await Feed.countDocuments({ idTatoueur: artistId });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
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
      tags: { $regex: new RegExp(tag, 'i') } 
    })
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const feedsWithCounts = feeds.map(feed => ({
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    }));

    const total = await Feed.countDocuments({ 
      tags: { $regex: new RegExp(tag, 'i') } 
    });

    res.status(200).json({
      publications: feedsWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeedById = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id)
      .populate('idTatoueur', 'nom prenom photoProfil email localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .lean();

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const feedWithCounts = {
      ...feed,
      likesCount: feed.likes ? feed.likes.length : 0,
      commentsCount: feed.commentaires ? feed.commentaires.length : 0
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFeed = async (req, res) => {
  try {
    const { contenu, tags } = req.body;
    const idTatoueur = req.user._id;

    // Traiter les tags
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Extraire les hashtags du contenu
    const hashtagRegex = /#\w+/g;
    const contentHashtags = contenu ? contenu.match(hashtagRegex) || [] : [];
    const extractedTags = contentHashtags.map(tag => tag.substring(1).toLowerCase());
    
    // Combiner les tags explicites et ceux extraits du contenu
    const allTags = [...new Set([...parsedTags, ...extractedTags])];

    const feedData = {
      idTatoueur,
      contenu,
      tags: allTags,
      image: req.file ? req.file.path : null,
      datePublication: new Date()
    };

    const feed = new Feed(feedData);
    await feed.save();

    const populatedFeed = await Feed.findById(feed._id)
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .lean();

    const feedWithCounts = {
      ...populatedFeed,
      likesCount: 0,
      commentsCount: 0
    };

    res.status(201).json(feedWithCounts);
  } catch (error) {
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

    // Vérifier que l'utilisateur est le propriétaire
    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.contenu = contenu;
    
    // Traiter les tags
    if (tags) {
      let parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      
      // Extraire les hashtags du nouveau contenu
      const hashtagRegex = /#\w+/g;
      const contentHashtags = contenu ? contenu.match(hashtagRegex) || [] : [];
      const extractedTags = contentHashtags.map(tag => tag.substring(1).toLowerCase());
      
      feed.tags = [...new Set([...parsedTags, ...extractedTags])];
    }
    
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate('idTatoueur', 'nom prenom photoProfil localisation styles userType')
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires ? updatedFeed.commentaires.length : 0
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await Feed.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Publication supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likeFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || req.user.type || 'Client';
    
    const existingLike = feed.likes.find(
      like => like.userId.toString() === userId.toString()
    );

    if (existingLike) {
      // Retirer le like
      feed.likes = feed.likes.filter(
        like => like.userId.toString() !== userId.toString()
      );
    } else {
      // Ajouter le like
      feed.likes.push({
        userId,
        userType,
        dateLike: new Date()
      });
    }

    await feed.save();
    
    const updatedFeed = await Feed.findById(feed._id)
      .populate('likes.userId', 'nom prenom photoProfil userType')
      .populate('idTatoueur', 'nom prenom photoProfil userType')
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires ? updatedFeed.commentaires.length : 0
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSavedFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts',
        populate: [
          {
            path: 'idTatoueur',
            select: 'nom prenom photoProfil localisation styles userType'
          },
          {
            path: 'likes.userId',
            select: 'nom prenom photoProfil userType'
          },
          {
            path: 'commentaires.userId',
            select: 'nom prenom photoProfil userType'
          }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const savedPosts = user.savedPosts || [];
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = savedPosts.slice(startIndex, endIndex);

    const postsWithCounts = paginatedPosts.map(post => ({
      ...post.toObject(),
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.commentaires ? post.commentaires.length : 0
    }));

    res.status(200).json({
      publications: postsWithCounts,
      totalPages: Math.ceil(savedPosts.length / limit),
      currentPage: parseInt(page),
      total: savedPosts.length,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveFeed = async (req, res) => {
  try {
    const feedId = req.params.id;
    const userId = req.user._id;

    // Vérifier que la publication existe
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
      // Si déjà sauvegardée, on peut la retirer (toggle)
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== feedId);
      await user.save();
      res.status(200).json({ message: "Publication retirée des favoris", saved: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unsaveFeed = async (req, res) => {
  try {
    const feedId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.savedPosts) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== feedId);
      await user.save();
    }

    res.status(200).json({ message: "Publication retirée des favoris", saved: false });
  } catch (error) {
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
      userType: req.user.userType || req.user.type || 'Client',
      contenu,
      dateCommentaire: new Date(),
      likes: []
    };

    feed.commentaires.push(newComment);
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .populate('idTatoueur', 'nom prenom photoProfil userType')
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires ? updatedFeed.commentaires.length : 0
    };

    res.status(201).json(feedWithCounts);
  } catch (error) {
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

    // Vérifier que l'utilisateur est le propriétaire du commentaire ou de la publication
    if (comment.userId.toString() !== req.user._id.toString() && 
        feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.commentaires.pull(req.params.commentId);
    await feed.save();

    res.status(200).json({ message: "Commentaire supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likeComment = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Publication non trouvée" });
    }

    const comment = feed.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    const userId = req.user._id;
    const userType = req.user.userType || req.user.type || 'Client';

    if (!comment.likes) comment.likes = [];

    const existingLike = comment.likes.find(
      like => like.userId.toString() === userId.toString()
    );

    if (existingLike) {
      // Retirer le like
      comment.likes = comment.likes.filter(
        like => like.userId.toString() !== userId.toString()
      );
    } else {
      // Ajouter le like
      comment.likes.push({
        userId,
        userType,
        dateLike: new Date()
      });
    }

    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate('commentaires.userId', 'nom prenom photoProfil userType')
      .populate('commentaires.likes.userId', 'nom prenom photoProfil userType')
      .populate('idTatoueur', 'nom prenom photoProfil userType')
      .lean();

    const feedWithCounts = {
      ...updatedFeed,
      likesCount: updatedFeed.likes ? updatedFeed.likes.length : 0,
      commentsCount: updatedFeed.commentaires ? updatedFeed.commentaires.length : 0
    };

    res.status(200).json(feedWithCounts);
  } catch (error) {
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
  searchFeedsByTag
};