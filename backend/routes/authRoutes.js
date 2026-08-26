const express = require("express");
const router = express.Router();
const {
  login,
  register,
  createEmployeeByManager,
  batchGenerateEmployees,
  getDemoProfiles,
  demoLogin,
  getCurrentUser,
  getAllEmployees,
} = require("../controllers/authController");
const { authenticate, requireManager } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);
router.post("/register", register);
router.get("/demo-profiles", getDemoProfiles);
router.post("/demo-login", demoLogin);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.get("/employees", authenticate, getAllEmployees);

// Manager-only employee creation powers
router.post("/create-employee", authenticate, requireManager, createEmployeeByManager);
router.post("/batch-generate-employees", authenticate, requireManager, batchGenerateEmployees);

module.exports = router;
