const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

// GET /api/tasks (List tasks with search & filters)
async function getTasks(req, res) {
  try {
    const { status, priority, assignedToId, search } = req.query;
    const isManager = req.user.role === "manager";

    const tasksSnapshot = await db.collection("tasks").get();
    let tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push(doc.data());
    });

    // If Employee, only show tasks assigned to them (unless explicitly requested team tasks)
    if (!isManager && !req.query.all) {
      tasks = tasks.filter((t) => t.assignedToId === req.user.id);
    } else if (assignedToId) {
      tasks = tasks.filter((t) => t.assignedToId === assignedToId);
    }

    // Filter by status
    if (status && status !== "All") {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by priority
    if (priority && priority !== "All") {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    // Filter by search term
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // Sort by createdAt descending
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("getTasks error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch tasks.", error: error.message });
  }
}

// GET /api/tasks/:id (Single task with full updates timeline)
async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const taskDoc = await db.collection("tasks").doc(id).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = taskDoc.data();

    // Fetch related updates
    const updatesSnapshot = await db.collection("updates").where("taskId", "==", id).get();
    const updates = [];
    updatesSnapshot.forEach((doc) => {
      updates.push(doc.data());
    });

    // Sort updates newest first
    updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      task: {
        ...task,
        updates,
      },
    });
  } catch (error) {
    console.error("getTaskById error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch task details.", error: error.message });
  }
}

// POST /api/tasks (Create & Assign Task - Manager only)
async function createTask(req, res) {
  try {
    const { title, description, assignedToId, priority = "Medium", deadline, category = "General", tags = [] } = req.body;

    if (!title || !assignedToId || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, assigned employee, and deadline are required.",
      });
    }

    // Lookup assignee info
    const assigneeDoc = await db.collection("users").doc(assignedToId).get();
    if (!assigneeDoc.exists) {
      return res.status(400).json({ success: false, message: "Assigned employee not found." });
    }
    const assigneeData = assigneeDoc.data();

    const taskId = "task_" + uuidv4().substring(0, 8);
    const newTask = {
      id: taskId,
      title: title.trim(),
      description: (description || "").trim(),
      assignedToId: assigneeData.id,
      assignedToName: assigneeData.name,
      assignedToAvatar: assigneeData.avatar,
      createdById: req.user.id,
      createdByName: req.user.name,
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      deadline,
      status: "Pending",
      progress: 0,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      totalHoursSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(taskId).set(newTask);

    return res.status(201).json({
      success: true,
      message: `Task successfully assigned to ${assigneeData.name}!`,
      task: newTask,
    });
  } catch (error) {
    console.error("createTask error:", error);
    return res.status(500).json({ success: false, message: "Failed to create task.", error: error.message });
  }
}

// PATCH /api/tasks/:id/status (Update Task Status: Pending -> In Progress -> Completed)
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Completed"];
    const normalizedStatus = validStatuses.find((s) => s.toLowerCase() === (status || "").toLowerCase());

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: 'Pending', 'In Progress', 'Completed'.",
      });
    }

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const currentTask = taskDoc.data();

    // Verify permission: Either Manager or the Assignee can change status
    if (req.user.role !== "manager" && currentTask.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update tasks assigned to you.",
      });
    }

    let updatedProgress = currentTask.progress;
    if (normalizedStatus === "Completed") {
      updatedProgress = 100;
    } else if (normalizedStatus === "Pending") {
      updatedProgress = 0;
    } else if (normalizedStatus === "In Progress" && updatedProgress === 0) {
      updatedProgress = 10;
    }

    const updatePayload = {
      status: normalizedStatus,
      progress: updatedProgress,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(id).update(updatePayload);

    return res.json({
      success: true,
      message: `Status updated to ${normalizedStatus}`,
      task: {
        ...currentTask,
        ...updatePayload,
      },
    });
  } catch (error) {
    console.error("updateTaskStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task status.", error: error.message });
  }
}

// PUT /api/tasks/:id (Full Task Update - Manager only)
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updateData.id;

    await db.collection("tasks").doc(id).update(updateData);

    return res.json({
      success: true,
      message: "Task updated successfully.",
      task: { ...taskDoc.data(), ...updateData },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task.", error: error.message });
  }
}

// DELETE /api/tasks/:id (Delete Task - Manager only)
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    await db.collection("tasks").doc(id).delete();

    return res.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete task.", error: error.message });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
