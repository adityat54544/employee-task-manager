const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getDemoProfiles,
  demoLogin,
  getCurrentUser,
  getAllEmployees,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);
router.post("/register", register);
router.get("/demo-profiles", getDemoProfiles);
router.post("/demo-login", demoLogin);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.get("/employees", authenticate, getAllEmployees);

module.exports = router;
