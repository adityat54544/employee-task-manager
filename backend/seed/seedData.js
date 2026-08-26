const bcrypt = require("bcryptjs");

const defaultPasswordHash = bcrypt.hashSync("password123", 10);

const seedUsers = [
  {
    id: "user_manager_1",
    name: "Sarah Jenkins",
    email: "manager@company.com",
    password: defaultPasswordHash,
    role: "manager",
    department: "Engineering Lead & Product Manager",
    employeeCode: "MGR-001",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_emp_1",
    name: "Rahul Sharma",
    email: "rahul@company.com",
    password: defaultPasswordHash,
    role: "employee",
    department: "Mobile Frontend Engineer",
    employeeCode: "EMP-104",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_emp_2",
    name: "Alex Chen",
    email: "alex@company.com",
    password: defaultPasswordHash,
    role: "employee",
    department: "Backend & Cloud Engineer",
    employeeCode: "EMP-108",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_emp_3",
    name: "Priya Patel",
    email: "priya@company.com",
    password: defaultPasswordHash,
    role: "employee",
    department: "UI/UX & Design Systems",
    employeeCode: "EMP-112",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

const seedTasks = [
  {
    id: "task_1",
    title: "Build Login Screen with Glassmorphism",
    description: "Design and implement the authentication screen featuring frosted glass cards, glowing neon buttons, and JWT session handling.",
    assignedToId: "user_emp_1",
    assignedToName: "Rahul Sharma",
    assignedToAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "High",
    deadline: "2026-08-30",
    status: "In Progress",
    progress: 70,
    category: "Frontend UI",
    tags: ["React Native", "Expo", "Glassmorphism", "Auth"],
    totalHoursSpent: 7.5,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    title: "Implement REST Task CRUD Endpoints",
    description: "Create clean Express endpoints for Task creation, status updates, employee assignment, and work update logging with role-based JWT auth.",
    assignedToId: "user_emp_2",
    assignedToName: "Alex Chen",
    assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "High",
    deadline: "2026-08-28",
    status: "Completed",
    progress: 100,
    category: "Backend API",
    tags: ["Node.js", "Express", "REST API", "JWT"],
    totalHoursSpent: 7.5,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "task_3",
    title: "Design Dark Neomorphic App Badges & Icons",
    description: "Create glowing status badges (Pending, In Progress, Completed) and responsive visual components for mobile dashboards.",
    assignedToId: "user_emp_3",
    assignedToName: "Priya Patel",
    assignedToAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "Medium",
    deadline: "2026-09-02",
    status: "In Progress",
    progress: 45,
    category: "Design System",
    tags: ["UI/UX", "Figma", "Design Tokens"],
    totalHoursSpent: 2.5,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_4",
    title: "Firebase Firestore Sync & CLI Integration",
    description: "Set up Firestore security rules and serviceAccountKey configuration with seamless offline fallback for employers.",
    assignedToId: "user_emp_2",
    assignedToName: "Alex Chen",
    assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "Medium",
    deadline: "2026-09-05",
    status: "Pending",
    progress: 0,
    category: "Cloud Database",
    tags: ["Firebase", "Firestore", "DevOps"],
    totalHoursSpent: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task_5",
    title: "Optimize Screen Transitions & Performance",
    description: "Profile Expo render times, optimize FlatList rendering for large task feeds, and test smooth 60fps animations.",
    assignedToId: "user_emp_1",
    assignedToName: "Rahul Sharma",
    assignedToAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdById: "user_manager_1",
    createdByName: "Sarah Jenkins",
    priority: "Low",
    deadline: "2026-09-10",
    status: "Pending",
    progress: 0,
    category: "Performance",
    tags: ["React Native", "Reanimated", "Optimization"],
    totalHoursSpent: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedUpdates = [
  {
    id: "update_1",
    taskId: "task_1",
    taskTitle: "Build Login Screen with Glassmorphism",
    userId: "user_emp_1",
    userName: "Rahul Sharma",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    note: "Set up Expo LinearGradient and built custom GlassCard container component with backdrop blur and glow effects.",
    previousProgress: 0,
    newProgress: 40,
    hoursSpent: 3.5,
    isBlocker: false,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "update_2",
    taskId: "task_1",
    taskTitle: "Build Login Screen with Glassmorphism",
    userId: "user_emp_1",
    userName: "Rahul Sharma",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    note: "Integrated JWT Auth Context and added smooth button press spring animations with one-click demo login buttons.",
    previousProgress: 40,
    newProgress: 70,
    hoursSpent: 4.0,
    isBlocker: false,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "update_3",
    taskId: "task_2",
    taskTitle: "Implement REST Task CRUD Endpoints",
    userId: "user_emp_2",
    userName: "Alex Chen",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    note: "Defined Express router and implemented JWT middleware with role-based checks for managers vs employees.",
    previousProgress: 0,
    newProgress: 60,
    hoursSpent: 4.5,
    isBlocker: false,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "update_4",
    taskId: "task_2",
    taskTitle: "Implement REST Task CRUD Endpoints",
    userId: "user_emp_2",
    userName: "Alex Chen",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    note: "Integrated Firebase Admin SDK and verified all CRUD route tests. Status changed to Completed.",
    previousProgress: 60,
    newProgress: 100,
    hoursSpent: 3.0,
    isBlocker: false,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "update_5",
    taskId: "task_3",
    taskTitle: "Design Dark Neomorphic App Badges & Icons",
    userId: "user_emp_3",
    userName: "Priya Patel",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    note: "Drafted color palette (Obsidian, Cyan glow, Emerald, Rose) and badge tokens.",
    previousProgress: 0,
    newProgress: 45,
    hoursSpent: 2.5,
    isBlocker: false,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

async function seedDatabase(database) {
  console.log("🌱 [Seed] Seeding database with demo users, tasks, and updates...");

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

  console.log(`✅ [Seed] Successfully seeded:
  - ${seedUsers.length} Users (1 Manager, 3 Employees)
  - ${seedTasks.length} Tasks
  - ${seedUpdates.length} Work Update Logs`);
}

module.exports = {
  seedUsers,
  seedTasks,
  seedUpdates,
  seedDatabase,
};
