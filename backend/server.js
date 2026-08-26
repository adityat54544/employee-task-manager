require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db, isFirebaseConnected, mode } = require("./config/firebase");
const { seedDatabase } = require("./seed/seedData");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health Check & System Status
app.get("/api/health", (req, res) => {
  return res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    database: {
      mode,
      isFirebaseConnected,
      provider: isFirebaseConnected ? "Google Cloud Firebase Firestore" : "High-Fidelity In-Memory Store (Demo Mode)",
    },
    version: "1.0.0",
  });
});

// One-Click Re-seed API endpoint (useful for demo resets)
app.post("/api/seed", async (req, res) => {
  try {
    await seedDatabase(db);
    return res.json({ success: true, message: "Database re-seeded successfully with demo data!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to seed database.", error: error.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

// Start Server and Auto-Seed Demo Data
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Task Manager API Server running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Database Mode: ${mode.toUpperCase()} (Connected: ${isFirebaseConnected})`);
  console.log(`======================================================\n`);

  // Auto-seed initially
  try {
    await seedDatabase(db);
  } catch (err) {
    console.warn("Auto-seed error:", err.message);
  }
});
