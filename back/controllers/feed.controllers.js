const Feed = require("../models/feed.model");

const getFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find();
    res.status(200).json(feeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFeeds,
};
