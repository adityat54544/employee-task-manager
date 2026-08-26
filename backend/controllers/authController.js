const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const { seedUsers } = require("../seed/seedData");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Standard Login with Email & Password
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const usersSnapshot = await db.collection("users").where("email", "==", email.toLowerCase().trim()).get();
    if (usersSnapshot.empty) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);
    const userProfile = { ...user };
    delete userProfile.password;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during login.", error: error.message });
  }
}

// Register new user (Manager or Employee)
async function register(req, res) {
  try {
    const { name, email, password, role = "employee", department = "Engineering" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    // Check existing
    const existing = await db.collection("users").where("email", "==", email.toLowerCase().trim()).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const userId = "user_" + uuidv4().substring(0, 8);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const employeeCode = (role === "manager" ? "MGR-" : "EMP-") + Math.floor(100 + Math.random() * 900);

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.toLowerCase() === "manager" ? "manager" : "employee",
      department: department.trim(),
      employeeCode,
      avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(userId).set(newUser);

    const token = generateToken(newUser);
    const userProfile = { ...newUser };
    delete userProfile.password;

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during registration.", error: error.message });
  }
}

// 1-Click Demo Profiles List (For Quick Employer Testing)
async function getDemoProfiles(req, res) {
  try {
    const profiles = seedUsers.map((u) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    return res.json({ success: true, profiles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching demo profiles.", error: error.message });
  }
}

// 1-Click Demo Login
async function demoLogin(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required for demo login." });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    let user;

    if (!userDoc.exists) {
      // Fallback to seedUsers list
      const matched = seedUsers.find((u) => u.id === userId);
      if (!matched) {
        return res.status(404).json({ success: false, message: "Demo user not found." });
      }
      user = matched;
      await db.collection("users").doc(user.id).set(user);
    } else {
      user = userDoc.data();
    }

    const token = generateToken(user);
    const userProfile = { ...user };
    delete userProfile.password;

    return res.json({
      success: true,
      message: `Demo logged in as ${user.name} (${user.role.toUpperCase()})`,
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return res.status(500).json({ success: false, message: "Error in demo login.", error: error.message });
  }
}

// Get current user profile
async function getCurrentUser(req, res) {
  return res.json({ success: true, user: req.user });
}

// Get all employees for Manager dropdown assignment
async function getAllEmployees(req, res) {
  try {
    const usersSnapshot = await db.collection("users").get();
    const employees = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      delete data.password;
      employees.push(data);
    });
    return res.json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching employees list.", error: error.message });
  }
}

module.exports = {
  login,
  register,
  getDemoProfiles,
  demoLogin,
  getCurrentUser,
  getAllEmployees,
};
