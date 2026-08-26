const express = require("express");
const router = express.Router();
const {
  login,
  register,
  updatePresence,
  createEmployeeByManager,
  batchGenerateEmployees,
  updateEmployee,
  deleteEmployee,
  getDemoProfiles,
  demoLogin,
  getCurrentUser,
  getAllEmployees,
} = require("../controllers/authController");
const { authenticate, requireManager } = require("../middleware/authMiddleware");

// Public
router.post("/login", login);
router.post("/register", register);
router.get("/demo-profiles", getDemoProfiles);
router.post("/demo-login", demoLogin);

// Protected
router.get("/me", authenticate, getCurrentUser);
router.get("/employees", authenticate, getAllEmployees);
router.patch("/presence", authenticate, updatePresence);

// Manager-only
router.post("/create-employee", authenticate, requireManager, createEmployeeByManager);
router.post("/batch-generate-employees", authenticate, requireManager, batchGenerateEmployees);
router.patch("/employees/:id", authenticate, requireManager, updateEmployee);
router.delete("/employees/:id", authenticate, requireManager, deleteEmployee);

module.exports = router;
