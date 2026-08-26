const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  togglePinMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  clearChannel,
} = require("../controllers/chatController");
const { authenticate } = require("../middleware/authMiddleware");

// All chat endpoints require JWT authentication
router.use(authenticate);

router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.patch("/messages/:id/pin", togglePinMessage);
router.patch("/messages/:id", editMessage);
router.delete("/messages/:id", deleteMessage);
router.post("/messages/:id/react", toggleReaction);
router.delete("/clear", clearChannel);

module.exports = router;
