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

// Helper: Generate Random Credentials for Instant Employee Creation
function generateRandomCreds(name = "Employee") {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const email = `${cleanName || "emp"}.${randomNum}@company.com`;
  const password = `Pass#${Math.floor(100 + Math.random() * 900)}!`;
  const employeeCode = `EMP-${randomNum}`;
  return { email, password, employeeCode };
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
      rawPassword: password, // preserved for demo convenience so managers can see it
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

// Manager Power: Create New Employee (Custom or Random Generated Credentials)
async function createEmployeeByManager(req, res) {
  try {
    const { name, email, password, department = "Software Engineering" } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Employee name is required." });
    }

    const generated = generateRandomCreds(name.trim());
    const finalEmail = (email && email.trim() !== "") ? email.toLowerCase().trim() : generated.email;
    const finalPassword = (password && password.trim() !== "") ? password.trim() : generated.password;
    const employeeCode = generated.employeeCode;

    // Check if email exists
    const existing = await db.collection("users").where("email", "==", finalEmail).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, message: `An account with email ${finalEmail} already exists.` });
    }

    const userId = "user_emp_" + uuidv4().substring(0, 8);
    const hashedPassword = bcrypt.hashSync(finalPassword, 10);

    const newEmployee = {
      id: userId,
      name: name.trim(),
      email: finalEmail,
      password: hashedPassword,
      rawPassword: finalPassword, // for manager to review credentials
      role: "employee",
      department: department.trim(),
      employeeCode,
      avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name.trim())}`,
      createdByManagerId: req.user.id,
      createdByManagerName: req.user.name,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(userId).set(newEmployee);

    const employeeProfile = { ...newEmployee };
    delete employeeProfile.password;

    return res.status(201).json({
      success: true,
      message: `Employee ${name.trim()} created successfully!`,
      credentials: {
        email: finalEmail,
        password: finalPassword,
        employeeCode,
      },
      employee: employeeProfile,
    });
  } catch (error) {
    console.error("createEmployeeByManager error:", error);
    return res.status(500).json({ success: false, message: "Failed to create employee.", error: error.message });
  }
}

// Manager Power: Batch Generate Random Employees (e.g. 3 random employees at once)
async function batchGenerateEmployees(req, res) {
  try {
    const randomProfiles = [
      { name: "Devon Vance", dept: "Frontend Mobile Engineer" },
      { name: "Maya Lin", dept: "Backend & Cloud Engineer" },
      { name: "Rohan Varma", dept: "UI/UX & Product Designer" },
      { name: "Elena Rostova", dept: "QA & Automation Specialist" },
      { name: "Tariq Mansoor", dept: "DevOps & Infrastructure" },
    ];

    const count = Math.min(5, Math.max(1, Number(req.body.count) || 3));
    const createdList = [];

    for (let i = 0; i < count; i++) {
      const template = randomProfiles[i % randomProfiles.length];
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const name = `${template.name} ${randomSuffix}`;
      const generated = generateRandomCreds(name);

      const userId = "user_emp_" + uuidv4().substring(0, 8);
      const hashedPassword = bcrypt.hashSync(generated.password, 10);

      const employee = {
        id: userId,
        name,
        email: generated.email,
        password: hashedPassword,
        rawPassword: generated.password,
        role: "employee",
        department: template.dept,
        employeeCode: generated.employeeCode,
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}`,
        createdByManagerId: req.user.id,
        createdByManagerName: req.user.name,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(userId).set(employee);

      const profile = { ...employee };
      delete profile.password;

      createdList.push({
        profile,
        credentials: {
          email: generated.email,
          password: generated.password,
          employeeCode: generated.employeeCode,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully generated ${createdList.length} random employees!`,
      employees: createdList,
    });
  } catch (error) {
    console.error("batchGenerateEmployees error:", error);
    return res.status(500).json({ success: false, message: "Batch generation failed.", error: error.message });
  }
}

// 1-Click Demo Profiles List
async function getDemoProfiles(req, res) {
  try {
    const usersSnapshot = await db.collection("users").get();
    const profiles = [];
    usersSnapshot.forEach((doc) => {
      const u = doc.data();
      const copy = { ...u };
      delete copy.password;
      profiles.push(copy);
    });

    if (profiles.length === 0) {
      return res.json({ success: true, profiles: seedUsers });
    }

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
      const matched = seedUsers.find((u) => u.id === userId);
      if (!matched) {
        return res.status(404).json({ success: false, message: "User not found." });
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
      message: `Logged in as ${user.name} (${user.role.toUpperCase()})`,
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

// Get all employees for Manager dropdown assignment and team management
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
  createEmployeeByManager,
  batchGenerateEmployees,
  getDemoProfiles,
  demoLogin,
  getCurrentUser,
  getAllEmployees,
};
