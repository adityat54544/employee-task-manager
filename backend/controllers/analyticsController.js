const { db } = require("../config/firebase");

// GET /api/analytics/dashboard
async function getDashboardStats(req, res) {
  try {
    const isManager = req.user.role === "manager";

    const [tasksSnapshot, usersSnapshot, updatesSnapshot] = await Promise.all([
      db.collection("tasks").get(),
      db.collection("users").get(),
      db.collection("updates").get(),
    ]);

    let tasks = [];
    tasksSnapshot.forEach((doc) => tasks.push(doc.data()));

    let users = [];
    usersSnapshot.forEach((doc) => users.push(doc.data()));

    let updates = [];
    updatesSnapshot.forEach((doc) => updates.push(doc.data()));

    // Filter relevant tasks
    const relevantTasks = isManager
      ? tasks
      : tasks.filter((t) => t.assignedToId === req.user.id);

    const totalTasks = relevantTasks.length;
    const pendingTasks = relevantTasks.filter((t) => t.status === "Pending").length;
    const inProgressTasks = relevantTasks.filter((t) => t.status === "In Progress").length;
    const completedTasks = relevantTasks.filter((t) => t.status === "Completed").length;
    const blockedTasks = relevantTasks.filter((t) => t.status === "Blocked").length;
    const highPriorityTasks = relevantTasks.filter((t) => t.priority === "High").length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Total hours logged
    const totalHoursLogged = relevantTasks.reduce((acc, t) => acc + (t.totalHoursSpent || 0), 0);

    // Live Team Presence & Attendance Tracker
    const employees = users.filter((u) => u.role === "employee");
    const presenceSummary = {
      online: employees.filter((e) => e.presence === "online" || !e.presence).length,
      focus: employees.filter((e) => e.presence === "focus").length,
      break: employees.filter((e) => e.presence === "break").length,
      offline: employees.filter((e) => e.presence === "offline" || e.presence === "leave").length,
    };

    // Team member workload breakdown (For Managers)
    let teamBreakdown = [];
    if (isManager) {
      teamBreakdown = employees.map((emp) => {
        const empTasks = tasks.filter((t) => t.assignedToId === emp.id);
        const empCompleted = empTasks.filter((t) => t.status === "Completed").length;
        const empPending = empTasks.filter((t) => t.status === "Pending").length;
        const empInProgress = empTasks.filter((t) => t.status === "In Progress").length;
        const empBlocked = empTasks.filter((t) => t.status === "Blocked").length;
        const empHours = empTasks.reduce((acc, t) => acc + (t.totalHoursSpent || 0), 0);

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          avatar: emp.avatar,
          department: emp.department,
          presence: emp.presence || "online",
          totalTasks: empTasks.length,
          completedTasks: empCompleted,
          inProgressTasks: empInProgress,
          pendingTasks: empPending,
          blockedTasks: empBlocked,
          totalHoursLogged: Math.round(empHours * 10) / 10,
          completionRate: empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0,
        };
      });
    }

    // Recent activity updates (last 6)
    updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = updates.slice(0, 6);

    return res.json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        blockedTasks,
        highPriorityTasks,
        completionRate,
        totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
        presenceSummary,
        teamBreakdown,
        recentActivity,
        totalTeamMembers: employees.length,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard analytics.",
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardStats,
};
