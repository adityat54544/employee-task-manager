const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);
router.get("/dashboard", getDashboardStats);

module.exports = router;
