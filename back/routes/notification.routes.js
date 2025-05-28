// localhost:3000/api/notifications

const { getNotifications } = require("../controllers/notification.controllers");

const router = require("express").Router();

router.get("/", getNotifications);

module.exports = router;
