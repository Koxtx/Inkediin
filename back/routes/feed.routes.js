const { 
  getFeeds, 
  getFeedById, 
  createFeed, 
  updateFeed, 
  deleteFeed,
  likeFeed,
  addComment,
  deleteComment
} = require("../controllers/feed.controllers");
const authentification = require("../middlewares/auth");
const {uploadFeed} = require("../middlewares/upload"); // Pour gérer les images

const router = require("express").Router();

// Routes publiques
router.get('/', getFeeds);
router.get('/:id', getFeedById);

// Routes protégées
router.post('/', authentification, uploadFeed.single('image'), createFeed);
router.put('/:id', authentification, updateFeed);
router.delete('/:id', authentification, deleteFeed);
router.post('/:id/like', authentification, likeFeed);
router.post('/:id/comments', authentification, addComment);
router.delete('/:id/comments/:commentId', authentification, deleteComment);

module.exports = router;
