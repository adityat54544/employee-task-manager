const { db } = require("../config/firebase");

// GET /api/analytics/dashboard
async function getDashboardStats(req, res) {
  try {
    const isManager = req.user.role === "manager";
    const tasksSnapshot = await db.collection("tasks").get();
    const updatesSnapshot = await db.collection("updates").get();

    let allTasks = [];
    tasksSnapshot.forEach((doc) => allTasks.push(doc.data()));

    let allUpdates = [];
    updatesSnapshot.forEach((doc) => allUpdates.push(doc.data()));

    // Filter for current user if employee
    const scopedTasks = isManager ? allTasks : allTasks.filter((t) => t.assignedToId === req.user.id);
    const scopedUpdates = isManager ? allUpdates : allUpdates.filter((u) => u.userId === req.user.id);

    const totalTasks = scopedTasks.length;
    const pendingTasks = scopedTasks.filter((t) => t.status === "Pending").length;
    const inProgressTasks = scopedTasks.filter((t) => t.status === "In Progress").length;
    const completedTasks = scopedTasks.filter((t) => t.status === "Completed").length;
    const highPriorityTasks = scopedTasks.filter((t) => t.priority === "High").length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalHoursLogged = scopedTasks.reduce((acc, t) => acc + (Number(t.totalHoursSpent) || 0), 0);

    // Recent activity feed (latest 5 updates)
    scopedUpdates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = scopedUpdates.slice(0, 5);

    // Team productivity breakdown (for Manager view)
    let teamBreakdown = [];
    if (isManager) {
      const usersSnapshot = await db.collection("users").get();
      const users = [];
      usersSnapshot.forEach((doc) => {
        const u = doc.data();
        if (u.role === "employee") users.push(u);
      });

      teamBreakdown = users.map((emp) => {
        const empTasks = allTasks.filter((t) => t.assignedToId === emp.id);
        const empCompleted = empTasks.filter((t) => t.status === "Completed").length;
        const empInProgress = empTasks.filter((t) => t.status === "In Progress").length;
        const empRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;

        return {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          avatar: emp.avatar,
          totalTasks: empTasks.length,
          completedTasks: empCompleted,
          inProgressTasks: empInProgress,
          completionRate: empRate,
        };
      });
    }

    return res.json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        highPriorityTasks,
        completionRate,
        totalHoursLogged,
        recentActivity,
        teamBreakdown,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats.", error: error.message });
  }
}

module.exports = {
  getDashboardStats,
};
