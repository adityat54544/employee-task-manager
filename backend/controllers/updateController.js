const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

// POST /api/tasks/:taskId/updates (Add Daily Work Update)
async function addWorkUpdate(req, res) {
  try {
    const { taskId } = req.params;
    const { note, progress, hoursSpent = 0, isBlocker = false } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({ success: false, message: "Work update note is required." });
    }

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = taskDoc.data();

    // Permission check: either assignee or manager
    if (req.user.role !== "manager" && task.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only add work updates to tasks assigned to you.",
      });
    }

    const prevProgress = task.progress || 0;
    const newProgress = progress !== undefined ? Math.min(100, Math.max(0, Number(progress))) : prevProgress;
    const hours = Number(hoursSpent) || 0;

    // Create Work Update Entry
    const updateId = "update_" + uuidv4().substring(0, 8);
    const newUpdate = {
      id: updateId,
      taskId: task.id,
      taskTitle: task.title,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      note: note.trim(),
      previousProgress: prevProgress,
      newProgress: newProgress,
      hoursSpent: hours,
      isBlocker: Boolean(isBlocker),
      createdAt: new Date().toISOString(),
    };

    await db.collection("updates").doc(updateId).set(newUpdate);

    // Update parent task state
    let newStatus = task.status;
    if (newProgress === 100) {
      newStatus = "Completed";
    } else if (newProgress > 0 && task.status === "Pending") {
      newStatus = "In Progress";
    }

    const updatedTotalHours = (Number(task.totalHoursSpent) || 0) + hours;

    const taskPatch = {
      progress: newProgress,
      status: newStatus,
      totalHoursSpent: updatedTotalHours,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(taskId).update(taskPatch);

    return res.status(201).json({
      success: true,
      message: "Daily work update recorded successfully!",
      update: newUpdate,
      task: {
        ...task,
        ...taskPatch,
      },
    });
  } catch (error) {
    console.error("addWorkUpdate error:", error);
    return res.status(500).json({ success: false, message: "Failed to add work update.", error: error.message });
  }
}

// GET /api/tasks/:taskId/updates (Get updates list)
async function getTaskUpdates(req, res) {
  try {
    const { taskId } = req.params;
    const updatesSnapshot = await db.collection("updates").where("taskId", "==", taskId).get();

    const updates = [];
    updatesSnapshot.forEach((doc) => updates.push(doc.data()));
    updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, count: updates.length, updates });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to get updates.", error: error.message });
  }
}

module.exports = {
  addWorkUpdate,
  getTaskUpdates,
};
