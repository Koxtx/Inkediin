// localhost:3000/api/feeds

const { getFeeds } = require("../controllers/feed.controllers");

const router = require("express").Router();

router.get('/',getFeeds)


module.exports = router;