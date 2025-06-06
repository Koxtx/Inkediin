const Feed = require("../models/feed.model");

const getFeeds = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'datePublication',
      order = 'desc',
      tatoueurId 
    } = req.query;

    const query = {};
    if (tatoueurId) query.idTatoueur = tatoueurId;

    const feeds = await Feed.find(query)
      .populate('idTatoueur', 'nom prenom photo')
      .populate('likes.userId', 'nom prenom')
      .populate('commentaires.userId', 'nom prenom')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Feed.countDocuments(query);

    res.status(200).json({
      feeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeedById = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id)
      .populate('idTatoueur', 'nom prenom photo email')
      .populate('likes.userId', 'nom prenom photo')
      .populate('commentaires.userId', 'nom prenom photo');

    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFeed = async (req, res) => {
  try {
    const { contenu } = req.body;
    const idTatoueur = req.user._id;

    const feedData = {
      idTatoueur,
      contenu,
      image: req.file ? req.file.path : null
    };

    const feed = new Feed(feedData);
    await feed.save();

    const populatedFeed = await Feed.findById(feed._id)
      .populate('idTatoueur', 'nom prenom photo');

    res.status(201).json(populatedFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFeed = async (req, res) => {
  try {
    const { contenu } = req.body;
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.contenu = contenu;
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate('idTatoueur', 'nom prenom photo');

    res.status(200).json(updatedFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (feed.idTatoueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await Feed.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Feed supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likeFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    const userId = req.user._id;
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
        userType: req.user.type || 'Client'
      });
    }

    await feed.save();
    
    const updatedFeed = await Feed.findById(feed._id)
      .populate('likes.userId', 'nom prenom');

    res.status(200).json(updatedFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const feed = await Feed.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    const newComment = {
      userId: req.user._id,
      userType: req.user.type || 'Client',
      contenu
    };

    feed.commentaires.push(newComment);
    await feed.save();

    const updatedFeed = await Feed.findById(feed._id)
      .populate('commentaires.userId', 'nom prenom photo');

    res.status(201).json(updatedFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: "Feed non trouvé" });
    }

    const comment = feed.commentaires.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire du commentaire
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    feed.commentaires.pull(req.params.commentId);
    await feed.save();

    res.status(200).json({ message: "Commentaire supprimé" });
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
  deleteComment
};

