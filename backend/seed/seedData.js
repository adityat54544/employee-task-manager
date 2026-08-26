const bcrypt = require("bcryptjs");

const defaultPasswordHash = bcrypt.hashSync("password123", 10);
const adityaPasswordHash = bcrypt.hashSync("aditya@123", 10);

const seedUsers = [
  {
    id: "user_manager_1",
    name: "Sarah Jenkins",
    email: "manager@company.com",
    password: defaultPasswordHash,
    rawPassword: "password123",
    role: "manager",
    department: "Engineering Lead & Product Manager",
    employeeCode: "MGR-001",
    presence: "online",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: "user_emp_aditya",
    name: "Aditya Tiwari",
    email: "aditya@company.com",
    password: adityaPasswordHash,
    rawPassword: "aditya@123",
    role: "employee",
    department: "Lead Full Stack & Mobile App Engineer",
    employeeCode: "EMP-101",
    presence: "focus",
    avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
];

const seedTasks = [
  {
    id: "task_1",
    title: "Finish Full-Stack Application Development",
    description: "Complete and polish the TaskMaster Pro architecture: React Native cross-platform screens, Express REST APIs, Firebase Cloud Firestore integration, real-time Live Chat with Manager moderation, and presence shift tracking.",
    assignedToId: "user_emp_aditya",
    assignedToName: "Aditya Tiwari",
    assignedToAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "High",
    deadline: "2026-09-01",
    status: "In Progress",
    progress: 75,
    category: "Full Stack Engineering",
    tags: ["React Native", "Node.js", "Firebase", "Live Chat", "JWT"],
    totalHoursSpent: 16.5,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    title: "Design Psychological Glassmorphism UI/UX System",
    description: "Implement dark midnight canvas (#080C14), Trust Indigo primary branding, Mint Emerald achievement badges, spring micro-physics, and animated password eye toggle.",
    assignedToId: "user_emp_aditya",
    assignedToName: "Aditya Tiwari",
    assignedToAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "High",
    deadline: "2026-08-30",
    status: "Completed",
    progress: 100,
    category: "UI/UX Architecture",
    tags: ["Glassmorphism", "Animations", "Design System"],
    totalHoursSpent: 12.0,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "task_3",
    title: "Build Real-Time Live Chat & Direct Messaging",
    description: "Implement multi-channel team chat (#general, #dev-team), manager moderation controls (pin, delete, edit, broadcast announcements), and confidential 1-on-1 private messaging to manager.",
    assignedToId: "user_emp_aditya",
    assignedToName: "Aditya Tiwari",
    assignedToAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "High",
    deadline: "2026-09-03",
    status: "Completed",
    progress: 100,
    category: "Real-Time Systems",
    tags: ["Live Chat", "DMs", "Moderation", "Sub-second Sync"],
    totalHoursSpent: 9.5,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_4",
    title: "Enterprise Shift & Work Presence Tracker",
    description: "Build live company presence indicators (Working Online, Deep Focus, Break, Out of Office) with real-time shift analytics on executive dashboard.",
    assignedToId: "user_emp_aditya",
    assignedToName: "Aditya Tiwari",
    assignedToAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "Medium",
    deadline: "2026-09-08",
    status: "In Progress",
    progress: 50,
    category: "Enterprise Features",
    tags: ["Attendance", "Presence", "Analytics"],
    totalHoursSpent: 4.5,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedUpdates = [
  {
    id: "update_1",
    taskId: "task_2",
    taskTitle: "Design Psychological Glassmorphism UI/UX System",
    userId: "user_emp_aditya",
    userName: "Aditya Tiwari",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    note: "Crafted precision glassmorphic design system with 1px top highlight, frosted cards, and spring animated password visibility eye button.",
    previousProgress: 0,
    newProgress: 100,
    hoursSpent: 12.0,
    isBlocker: false,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "update_2",
    taskId: "task_1",
    taskTitle: "Finish Full-Stack Application Development",
    userId: "user_emp_aditya",
    userName: "Aditya Tiwari",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    note: "Integrated REST APIs, employee direct completion action hubs, and workplace transparency notices. Progress reached 75%.",
    previousProgress: 40,
    newProgress: 75,
    hoursSpent: 6.5,
    isBlocker: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

const seedMessages = [
  {
    id: "msg_1",
    channel: "general",
    userId: "user_manager_1",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    userRole: "manager",
    userDepartment: "Engineering Lead",
    text: "📢 Sprint Announcement: TaskMaster Pro is ready for production review. All sprint tasks, live chat moderation, and transparent activity feeds are active.",
    isAnnouncement: true,
    isPinned: true,
    pinnedBy: "Sarah Jenkins",
    reactions: { "🚀": ["user_emp_aditya"], "👍": ["user_emp_aditya"] },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "msg_2",
    channel: "general",
    userId: "user_emp_aditya",
    userName: "Aditya Tiwari",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    userRole: "employee",
    userDepartment: "Lead Full Stack Engineer",
    text: "Hi Sarah! I have finished the UI design system, live chat moderation, password eye animation, and 1-tap employee task completion hub. Ready for executive review! 🚀",
    isAnnouncement: false,
    isPinned: false,
    reactions: { "🔥": ["user_manager_1"], "👏": ["user_manager_1"] },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "msg_3",
    channel: "dm_user_emp_aditya",
    userId: "user_emp_aditya",
    userName: "Aditya Tiwari",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
    userRole: "employee",
    userDepartment: "Lead Full Stack Engineer",
    text: "Hi Sarah, sending a private direct message to confirm our 1-on-1 sprint review schedule.",
    isAnnouncement: false,
    isPrivateDM: true,
    isPinned: false,
    reactions: {},
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "msg_4",
    channel: "dm_user_emp_aditya",
    userId: "user_manager_1",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    userRole: "manager",
    userDepartment: "Engineering Lead",
    text: "Hi Aditya, confirmed! Great work on completing the full-stack architecture.",
    isAnnouncement: false,
    isPrivateDM: true,
    isPinned: false,
    reactions: { "👍": ["user_emp_aditya"] },
    createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
];

async function seedDatabase(database) {
  console.log("🌱 [Seed] Seeding database with Manager (Sarah Jenkins) and Lead Developer (Aditya Tiwari)...");

  // Seed Users
  for (const user of seedUsers) {
    await database.collection("users").doc(user.id).set(user);
  }

  // Seed Tasks
  for (const task of seedTasks) {
    await database.collection("tasks").doc(task.id).set(task);
  }

  // Seed Updates
  for (const update of seedUpdates) {
    await database.collection("updates").doc(update.id).set(update);
  }

  // Seed Messages
  for (const msg of seedMessages) {
    await database.collection("messages").doc(msg.id).set(msg);
  }

  console.log(`✅ [Seed] Successfully seeded:
  - ${seedUsers.length} Users: Sarah Jenkins (Manager) & Aditya Tiwari (Employee)
  - ${seedTasks.length} Assigned Tasks
  - ${seedUpdates.length} Work Progress Logs
  - ${seedMessages.length} Live Chat & DM Messages`);
}

module.exports = {
  seedUsers,
  seedTasks,
  seedUpdates,
  seedMessages,
  seedDatabase,
};
