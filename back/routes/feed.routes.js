const express = require("express");
const router = express.Router();

const { 
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
  deleteReply
} = require("../controllers/feed.controllers");

const authentification = require("../middlewares/auth");
// ✅ CORRECTION: Import du middleware Cloudinary uniquement
const { uploadFeed, uploadFeedToCloudinary } = require("../middlewares/uplodCloudinary");

// ⚠️ ORDRE IMPORTANT : Routes spécifiques AVANT les routes avec paramètres

// 1. Routes publiques spécifiques (sans paramètres)
router.get('/', getFeeds);
router.get('/recommended', getRecommendedFeeds);

// 2. Routes protégées spécifiques (sans paramètres)
router.get('/followed', authentification, getFollowedFeeds);
router.get('/saved', authentification, getSavedFeeds);

// 3. Route de recherche par tag
router.get('/search', searchFeedsByTag);

// 4. Routes avec préfixe spécifique + paramètre
router.get('/artist/:artistId', getFeedsByTattooArtist);

// 5. Routes de création avec upload Cloudinary
router.post('/', authentification, uploadFeed, uploadFeedToCloudinary, createFeed);

// 6. Routes avec paramètre simple - APRÈS toutes les routes spécifiques
router.get('/:id', getFeedById);
router.put('/:id', authentification, updateFeed);
router.delete('/:id', authentification, deleteFeed);

// 7. Routes d'actions sur un feed spécifique
router.post('/:id/like', authentification, likeFeed);
router.post('/:id/save', authentification, saveFeed);
router.delete('/:id/save', authentification, unsaveFeed);

// 8. Routes de commentaires
router.post('/:id/comments', authentification, addComment);
router.delete('/:id/comments/:commentId', authentification, deleteComment);
router.post('/:id/comments/:commentId/like', authentification, likeComment);

// ✅ AJOUT: Nouvelles routes pour les réponses aux commentaires
router.post('/:id/comments/:commentId/replies', authentification, addReplyToComment);
router.post('/:id/comments/:commentId/replies/:replyId/like', authentification, likeReply);
router.delete('/:id/comments/:commentId/replies/:replyId', authentification, deleteReply);

module.exports = router;