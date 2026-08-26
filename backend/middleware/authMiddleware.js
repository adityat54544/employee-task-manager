const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "employee_task_manager_jwt_secret_key_2026";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from database
    const userDoc = await db.collection("users").doc(decoded.id).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: "User account associated with this token was not found.",
      });
    }

    const userData = userDoc.data();
    // Exclude password hash from req.user
    delete userData.password;

    req.user = userData;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired." });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or unauthorized token.",
      error: error.message,
    });
  }
}

function requireManager(req, res, next) {
  if (!req.user || req.user.role !== "manager") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: This action requires Manager privileges.",
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireManager,
  JWT_SECRET,
};
