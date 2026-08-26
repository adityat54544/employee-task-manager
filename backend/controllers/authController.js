const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const { seedUsers } = require("../seed/seedData");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function generateRandomCreds(name = "Employee") {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const email = `${cleanName || "emp"}.${randomNum}@company.com`;
  const password = `Pass#${Math.floor(100 + Math.random() * 900)}!`;
  const employeeCode = `EMP-${randomNum}`;
  return { email, password, employeeCode };
}

// User Login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const snap = await db.collection("users").where("email", "==", email.toLowerCase().trim()).get();
    if (snap.empty) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = snap.docs[0].data();
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Set presence to online on login
    await db.collection("users").doc(user.id).update({
      presence: "online",
      lastActive: new Date().toISOString(),
    });

    const token = generateToken(user);
    const profile = { ...user, presence: "online", lastActive: new Date().toISOString() };
    delete profile.password;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: profile,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Login error.", error: e.message });
  }
}

// Register
async function register(req, res) {
  try {
    const { name, email, password, role = "employee", department = "Engineering" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

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
      rawPassword: password,
      role: role.toLowerCase() === "manager" ? "manager" : "employee",
      department: department.trim(),
      employeeCode,
      presence: "online",
      avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await db.collection("users").doc(userId).set(newUser);

    // Broadcast registration event to Workplace Activity Stream
    const auditId = "audit_" + uuidv4().substring(0, 8);
    await db.collection("updates").doc(auditId).set({
      id: auditId,
      taskId: "general_org",
      taskTitle: "Workplace Roster Update",
      userId: userId,
      userName: name.trim(),
      userAvatar: newUser.avatar,
      note: `👋 New Team Member: ${name.trim()} joined the organization as ${newUser.role.toUpperCase()} (${department.trim()}).`,
      previousProgress: 0,
      newProgress: 100,
      hoursSpent: 0,
      isBlocker: false,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(newUser);
    const profile = { ...newUser };
    delete profile.password;

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: profile,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Registration error.", error: e.message });
  }
}

// Update Employee Presence / Attendance Status
async function updatePresence(req, res) {
  try {
    const { presence = "online", statusMessage = "" } = req.body;
    const validStatuses = ["online", "focus", "break", "offline", "leave"];
    const selected = validStatuses.includes(presence) ? presence : "online";

    await db.collection("users").doc(req.user.id).update({
      presence: selected,
      statusMessage: statusMessage.trim(),
      lastActive: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Work presence updated to ${selected.toUpperCase()}`,
      presence: selected,
      statusMessage: statusMessage.trim(),
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Update presence error.", error: e.message });
  }
}

// Manager: Create Employee with custom/random credentials
async function createEmployeeByManager(req, res) {
  try {
    const { name, email, password, department = "Software Engineering" } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Employee name is required." });
    }

    const generated = generateRandomCreds(name.trim());
    const finalEmail = (email && email.trim() !== "") ? email.toLowerCase().trim() : generated.email;
    const finalPassword = (password && password.trim() !== "") ? password.trim() : generated.password;

    const existing = await db.collection("users").where("email", "==", finalEmail).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, message: `Email ${finalEmail} already exists.` });
    }

    const userId = "user_emp_" + uuidv4().substring(0, 8);
    const newEmployee = {
      id: userId,
      name: name.trim(),
      email: finalEmail,
      password: bcrypt.hashSync(finalPassword, 10),
      rawPassword: finalPassword,
      role: "employee",
      department: department.trim(),
      employeeCode: generated.employeeCode,
      presence: "offline",
      avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name.trim())}`,
      createdByManagerId: req.user.id,
      createdByManagerName: req.user.name,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await db.collection("users").doc(userId).set(newEmployee);

    // Transparency Broadcast in Activity Stream
    const auditId = "audit_" + uuidv4().substring(0, 8);
    await db.collection("updates").doc(auditId).set({
      id: auditId,
      taskId: "general_org",
      taskTitle: "Workplace Roster Update",
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      note: `✨ Manager ${req.user.name} onboarded ${name.trim()} (${department.trim()}) to the team.`,
      previousProgress: 0,
      newProgress: 100,
      hoursSpent: 0,
      isBlocker: false,
      createdAt: new Date().toISOString(),
    });

    const profile = { ...newEmployee };
    delete profile.password;

    return res.status(201).json({
      success: true,
      message: `Employee ${name.trim()} onboarded successfully!`,
      credentials: { email: finalEmail, password: finalPassword, employeeCode: generated.employeeCode },
      employee: profile,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Create employee error.", error: e.message });
  }
}

// Manager: Batch Generate
async function batchGenerateEmployees(req, res) {
  try {
    const templates = [
      { name: "Devon Vance", dept: "Frontend Mobile Engineer" },
      { name: "Maya Lin", dept: "Backend & Cloud Engineer" },
      { name: "Rohan Varma", dept: "UI/UX & Product Designer" },
      { name: "Elena Rostova", dept: "QA & Automation" },
      { name: "Tariq Mansoor", dept: "DevOps & Infrastructure" },
    ];
    const count = Math.min(5, Math.max(1, Number(req.body.count) || 3));
    const createdList = [];

    for (let i = 0; i < count; i++) {
      const t = templates[i % templates.length];
      const suffix = Math.floor(100 + Math.random() * 900);
      const name = `${t.name} ${suffix}`;
      const gen = generateRandomCreds(name);
      const userId = "user_emp_" + uuidv4().substring(0, 8);

      const emp = {
        id: userId,
        name,
        email: gen.email,
        password: bcrypt.hashSync(gen.password, 10),
        rawPassword: gen.password,
        role: "employee",
        department: t.dept,
        employeeCode: gen.employeeCode,
        presence: "offline",
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}`,
        createdByManagerId: req.user.id,
        createdByManagerName: req.user.name,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      await db.collection("users").doc(userId).set(emp);
      const profile = { ...emp };
      delete profile.password;
      createdList.push({ profile, credentials: { email: gen.email, password: gen.password, employeeCode: gen.employeeCode } });
    }

    return res.status(201).json({ success: true, message: `Generated ${createdList.length} random employees!`, employees: createdList });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Batch generation failed.", error: e.message });
  }
}

// Manager: Edit Employee Profile
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { name, department } = req.body;

    const empDoc = await db.collection("users").doc(id).get();
    if (!empDoc.exists) return res.status(404).json({ success: false, message: "Employee not found." });

    const emp = empDoc.data();
    if (emp.role === "manager") return res.status(403).json({ success: false, message: "Cannot modify manager account." });

    const updates = { updatedAt: new Date().toISOString() };
    if (name && name.trim()) updates.name = name.trim();
    if (department && department.trim()) updates.department = department.trim();

    await db.collection("users").doc(id).update(updates);
    return res.json({ success: true, message: `Employee ${emp.name} updated successfully.`, updates });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Update employee error.", error: e.message });
  }
}

// Manager: Delete Employee Account with FULL WORKPLACE TRANSPARENCY NOTICE
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ success: false, message: "Cannot delete your own account." });

    const empDoc = await db.collection("users").doc(id).get();
    if (!empDoc.exists) return res.status(404).json({ success: false, message: "Employee not found." });

    const emp = empDoc.data();
    if (emp.role === "manager") return res.status(403).json({ success: false, message: "Cannot delete manager accounts." });

    // Unassign their tasks with transparency audit
    const tasksSnap = await db.collection("tasks").where("assignedToId", "==", id).get();
    const batch = [];
    const taskTitles = [];
    tasksSnap.forEach((doc) => {
      const t = doc.data();
      taskTitles.push(t.title);
      batch.push(db.collection("tasks").doc(doc.id).update({
        assignedToName: `[Unassigned — ${emp.name} removed by Manager]`,
        assignedToId: null,
        updatedAt: new Date().toISOString(),
      }));
    });
    await Promise.all(batch);

    // Delete user
    await db.collection("users").doc(id).delete();

    // TRANSPARENCY AUDIT: Broadcast offboarding event to Workplace Activity Stream & Chat
    const noticeText = `📢 Workplace Notice: ${emp.name} (${emp.department || "Employee"}) was removed from the team by Manager ${req.user.name}. ${tasksSnap.size} assigned task(s) (${taskTitles.slice(0, 2).join(", ") || "none"}) are now Unassigned.`;

    const auditId = "audit_" + uuidv4().substring(0, 8);
    await db.collection("updates").doc(auditId).set({
      id: auditId,
      taskId: "general_org",
      taskTitle: "Workplace Roster Notice",
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      note: noticeText,
      previousProgress: 0,
      newProgress: 0,
      hoursSpent: 0,
      isBlocker: false,
      createdAt: new Date().toISOString(),
    });

    // Also send an automated announcement message into #general chat
    const chatMsgId = "msg_" + uuidv4().substring(0, 8);
    await db.collection("messages").doc(chatMsgId).set({
      id: chatMsgId,
      channel: "general",
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      userRole: "manager",
      userDepartment: "Engineering Lead",
      text: noticeText,
      isAnnouncement: true,
      isPinned: false,
      reactions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Employee ${emp.name}'s account has been removed. All team members notified transparently.`,
      deletedName: emp.name,
      tasksUnassigned: batch.length,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Delete employee error.", error: e.message });
  }
}

async function getDemoProfiles(req, res) {
  try {
    const snap = await db.collection("users").get();
    const profiles = [];
    snap.forEach((doc) => {
      const u = doc.data();
      delete u.password;
      profiles.push(u);
    });
    if (profiles.length === 0) return res.json({ success: true, profiles: seedUsers });
    return res.json({ success: true, profiles });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error fetching demo profiles.", error: e.message });
  }
}

async function demoLogin(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required." });

    const userDoc = await db.collection("users").doc(userId).get();
    let user;

    if (!userDoc.exists) {
      const matched = seedUsers.find((u) => u.id === userId);
      if (!matched) return res.status(404).json({ success: false, message: "User not found." });
      user = matched;
      await db.collection("users").doc(user.id).set(user);
    } else {
      user = userDoc.data();
    }

    await db.collection("users").doc(user.id).update({
      presence: "online",
      lastActive: new Date().toISOString(),
    });

    const token = generateToken(user);
    const profile = { ...user, presence: "online" };
    delete profile.password;

    return res.json({
      success: true,
      message: `Logged in as ${user.name} (${user.role.toUpperCase()})`,
      token,
      user: profile,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Demo login error.", error: e.message });
  }
}

async function getCurrentUser(req, res) {
  return res.json({ success: true, user: req.user });
}

async function getAllEmployees(req, res) {
  try {
    const snap = await db.collection("users").get();
    const employees = [];
    snap.forEach((doc) => {
      const d = doc.data();
      delete d.password;
      employees.push(d);
    });
    return res.json({ success: true, employees });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error fetching employees.", error: e.message });
  }
}

module.exports = {
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
};
