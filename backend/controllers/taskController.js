const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

// GET /api/tasks (List tasks with advanced filtering, employee filter & sorting)
async function getTasks(req, res) {
  try {
    const { status, priority, assignedToId, search, sort = "newest" } = req.query;
    const isManager = req.user.role === "manager";

    const tasksSnapshot = await db.collection("tasks").get();
    let tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push(doc.data());
    });

    // If Employee, only show tasks assigned to them (unless team tasks explicitly requested)
    if (!isManager && !req.query.all) {
      tasks = tasks.filter((t) => t.assignedToId === req.user.id);
    } else if (assignedToId && assignedToId !== "All") {
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

    // Filter by search query
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

    // Sorting
    if (sort === "deadline_asc") {
      tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === "priority_desc") {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sort === "progress_desc") {
      tasks.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    } else {
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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

// GET /api/tasks/:id (Single task with full updates timeline & comments)
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
    updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Fetch comments
    const commentsSnapshot = await db.collection("comments").where("taskId", "==", id).get();
    const comments = [];
    commentsSnapshot.forEach((doc) => {
      comments.push(doc.data());
    });
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      task: {
        ...task,
        updates,
        comments,
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

    // Transparency Audit Notice
    const auditId = "audit_" + uuidv4().substring(0, 8);
    const assignmentNote = `📋 New Task Assigned: Manager ${req.user.name} assigned '${newTask.title}' to ${assigneeData.name} (Priority: ${newTask.priority}, Deadline: ${newTask.deadline}).`;
    await db.collection("updates").doc(auditId).set({
      id: auditId,
      taskId: taskId,
      taskTitle: newTask.title,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      note: assignmentNote,
      previousProgress: 0,
      newProgress: 0,
      hoursSpent: 0,
      isBlocker: false,
      createdAt: new Date().toISOString(),
    });

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

// PUT /api/tasks/:id (Manager Power: Edit Pre-existing Task Specifications & Reassign with Transparency)
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, assignedToId, priority, deadline, category, progress, status } = req.body;

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const currentTask = taskDoc.data();
    const updateData = { updatedAt: new Date().toISOString() };

    if (title && title.trim()) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority) updateData.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    if (deadline) updateData.deadline = deadline;
    if (category) updateData.category = category.trim();
    if (progress !== undefined) updateData.progress = Number(progress);
    if (status) updateData.status = status;

    let reassignmentNotice = "";

    // Handle employee reassignment if assignedToId changed
    if (assignedToId && assignedToId !== currentTask.assignedToId) {
      const assigneeDoc = await db.collection("users").doc(assignedToId).get();
      if (assigneeDoc.exists) {
        const assigneeData = assigneeDoc.data();
        const prevAssigneeName = currentTask.assignedToName || "Unassigned";
        updateData.assignedToId = assigneeData.id;
        updateData.assignedToName = assigneeData.name;
        updateData.assignedToAvatar = assigneeData.avatar;

        reassignmentNotice = `🔄 Task Reassigned: '${currentTask.title}' was reassigned from ${prevAssigneeName} to ${assigneeData.name} by Manager ${req.user.name}.`;

        // Log Transparency Audit Notice
        const auditId = "audit_" + uuidv4().substring(0, 8);
        await db.collection("updates").doc(auditId).set({
          id: auditId,
          taskId: id,
          taskTitle: currentTask.title,
          userId: req.user.id,
          userName: req.user.name,
          userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          note: reassignmentNotice,
          previousProgress: currentTask.progress,
          newProgress: currentTask.progress,
          hoursSpent: 0,
          isBlocker: false,
          createdAt: new Date().toISOString(),
        });

        // Broadcast to general chat so both employees know immediately
        const chatMsgId = "msg_" + uuidv4().substring(0, 8);
        await db.collection("messages").doc(chatMsgId).set({
          id: chatMsgId,
          channel: "general",
          userId: req.user.id,
          userName: req.user.name,
          userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          userRole: "manager",
          userDepartment: "Engineering Lead",
          text: reassignmentNotice,
          isAnnouncement: true,
          isPinned: false,
          reactions: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await db.collection("tasks").doc(id).update(updateData);
    const updated = { ...currentTask, ...updateData };

    return res.json({
      success: true,
      message: reassignmentNotice || `Task "${updated.title}" updated successfully!`,
      task: updated,
    });
  } catch (error) {
    console.error("updateTask error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task.", error: error.message });
  }
}

// PATCH /api/tasks/:id/status (Full Employee & Manager Freedom: Pending, In Progress, Completed, Blocked)
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note = "", hoursSpent = 0 } = req.body;

    const validStatuses = ["Pending", "In Progress", "Completed", "Blocked"];
    const normalizedStatus = validStatuses.find((s) => s.toLowerCase() === (status || "").toLowerCase());

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: 'Pending', 'In Progress', 'Completed', 'Blocked'.",
      });
    }

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const currentTask = taskDoc.data();

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
      updatedProgress = 25;
    }

    const updatePayload = {
      status: normalizedStatus,
      progress: updatedProgress,
      totalHoursSpent: (currentTask.totalHoursSpent || 0) + Number(hoursSpent || 0),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(id).update(updatePayload);

    const autoNote = note || (
      normalizedStatus === "Completed"
        ? `🎉 Marked as Completed (100% finished by ${req.user.name})`
        : normalizedStatus === "In Progress"
        ? `⚡ Started working on task (Status: In Progress)`
        : normalizedStatus === "Blocked"
        ? `🚨 Blocker reported by ${req.user.name} — requires manager attention`
        : `⏳ Task reset to Pending`
    );

    const updateId = "upd_" + uuidv4().substring(0, 8);
    const logItem = {
      id: updateId,
      taskId: id,
      taskTitle: currentTask.title,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(req.user.name)}`,
      note: autoNote,
      previousProgress: currentTask.progress,
      newProgress: updatedProgress,
      hoursSpent: Number(hoursSpent || 0),
      isBlocker: normalizedStatus === "Blocked",
      createdAt: new Date().toISOString(),
    };

    await db.collection("updates").doc(updateId).set(logItem);

    // If milestone completed or blocked, broadcast to general chat for full transparency
    if (normalizedStatus === "Completed" || normalizedStatus === "Blocked") {
      const broadcastMsgId = "msg_" + uuidv4().substring(0, 8);
      await db.collection("messages").doc(broadcastMsgId).set({
        id: broadcastMsgId,
        channel: "general",
        userId: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(req.user.name)}`,
        userRole: req.user.role,
        userDepartment: req.user.department,
        text: autoNote,
        isAnnouncement: normalizedStatus === "Blocked",
        isPinned: false,
        reactions: normalizedStatus === "Completed" ? { "🚀": [req.user.id] } : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: `Status updated to ${normalizedStatus}`,
      task: {
        ...currentTask,
        ...updatePayload,
      },
      auditLog: logItem,
    });
  } catch (error) {
    console.error("updateTaskStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task status.", error: error.message });
  }
}

// POST /api/tasks/:id/comments
async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty." });
    }

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const commentId = "comment_" + uuidv4().substring(0, 8);
    const newComment = {
      id: commentId,
      taskId: id,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      userRole: req.user.role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("comments").doc(commentId).set(newComment);

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message });
  }
}

// DELETE /api/tasks/:id (Manager only)
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = taskDoc.data();
    await db.collection("tasks").doc(id).delete();

    // Transparency broadcast
    const auditId = "audit_" + uuidv4().substring(0, 8);
    await db.collection("updates").doc(auditId).set({
      id: auditId,
      taskId: id,
      taskTitle: task.title,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      note: `🗑️ Task Removed: '${task.title}' was deleted from active sprint by Manager ${req.user.name}.`,
      previousProgress: 0,
      newProgress: 0,
      hoursSpent: 0,
      isBlocker: false,
      createdAt: new Date().toISOString(),
    });

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
  updateTask,
  updateTaskStatus,
  addComment,
  deleteTask,
};
