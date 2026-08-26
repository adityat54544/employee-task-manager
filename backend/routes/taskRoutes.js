const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  addComment,
  deleteTask,
} = require("../controllers/taskController");
const { addWorkUpdate, getTaskUpdates } = require("../controllers/updateController");
const { authenticate, requireManager } = require("../middleware/authMiddleware");

// All task routes require authentication
router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", requireManager, createTask);
router.patch("/:id/status", updateTaskStatus);
router.post("/:id/comments", addComment);
router.delete("/:id", requireManager, deleteTask);

// Work updates nested under task
router.post("/:taskId/updates", addWorkUpdate);
router.get("/:taskId/updates", getTaskUpdates);

module.exports = router;
