const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} = require("../controllers/notification.controllers");
const authentification = require("../middlewares/auth");

const router = require("express").Router();

// Toutes les routes nécessitent une authentification
router.use(authentification);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:notificationId/read", markAsRead);
router.put("/mark-all-read", markAllAsRead);

module.exports = router;