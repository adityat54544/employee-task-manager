const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

// GET /api/chat/messages (Fetch messages & pinned message)
async function getMessages(req, res) {
  try {
    const { channel = "general" } = req.query;

    const messagesSnapshot = await db.collection("messages").get();
    let messages = [];

    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.channel || data.channel === channel) {
        messages.push(data);
      }
    });

    // Sort oldest to newest for chronological chat stream
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Identify pinned messages
    const pinnedMessages = messages.filter((m) => m.isPinned);

    return res.json({
      success: true,
      count: messages.length,
      pinned: pinnedMessages,
      messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message });
  }
}

// POST /api/chat/messages (Send new message)
async function sendMessage(req, res) {
  try {
    const { text, channel = "general", isAnnouncement = false } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." });
    }

    const isManager = req.user.role === "manager";
    const messageId = "msg_" + uuidv4().substring(0, 8);

    const newMessage = {
      id: messageId,
      channel,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      userRole: req.user.role,
      userDepartment: req.user.department,
      text: text.trim(),
      isAnnouncement: Boolean(isAnnouncement && isManager),
      isPinned: false,
      isEdited: false,
      reactions: {}, // { '👍': ['user_1', 'user_2'], '🔥': ['user_3'] }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("messages").doc(messageId).set(newMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent.",
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ success: false, message: "Failed to send message.", error: error.message });
  }
}

// PATCH /api/chat/messages/:id/pin (Toggle Pin Message - Manager Only)
async function togglePinMessage(req, res) {
  try {
    const { id } = req.params;
    const isManager = req.user.role === "manager";

    if (!isManager) {
      return res.status(403).json({ success: false, message: "Only Managers have permission to pin messages." });
    }

    const msgDoc = await db.collection("messages").doc(id).get();
    if (!msgDoc.exists) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const currentMsg = msgDoc.data();
    const newPinnedState = !currentMsg.isPinned;

    await db.collection("messages").doc(id).update({
      isPinned: newPinnedState,
      pinnedBy: newPinnedState ? req.user.name : null,
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: newPinnedState ? "Message pinned to top!" : "Message unpinned.",
      isPinned: newPinnedState,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to toggle pin.", error: error.message });
  }
}

// PATCH /api/chat/messages/:id (Edit Message - Author or Manager)
async function editMessage(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Edited message text cannot be empty." });
    }

    const msgDoc = await db.collection("messages").doc(id).get();
    if (!msgDoc.exists) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const currentMsg = msgDoc.data();
    const isManager = req.user.role === "manager";
    const isAuthor = currentMsg.userId === req.user.id;

    if (!isAuthor && !isManager) {
      return res.status(403).json({ success: false, message: "You don't have permission to edit this message." });
    }

    const updateData = {
      text: text.trim(),
      isEdited: true,
      editedByRole: isManager && !isAuthor ? "manager_moderator" : "author",
      updatedAt: new Date().toISOString(),
    };

    await db.collection("messages").doc(id).update(updateData);

    return res.json({
      success: true,
      message: "Message updated successfully.",
      data: { ...currentMsg, ...updateData },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to edit message.", error: error.message });
  }
}

// DELETE /api/chat/messages/:id (Delete Message - Author or Manager)
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    const msgDoc = await db.collection("messages").doc(id).get();
    if (!msgDoc.exists) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const currentMsg = msgDoc.data();
    const isManager = req.user.role === "manager";
    const isAuthor = currentMsg.userId === req.user.id;

    if (!isAuthor && !isManager) {
      return res.status(403).json({ success: false, message: "You don't have permission to delete this message." });
    }

    await db.collection("messages").doc(id).delete();

    return res.json({
      success: true,
      message: "Message deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete message.", error: error.message });
  }
}

// POST /api/chat/messages/:id/react (Toggle Emoji Reaction)
async function toggleReaction(req, res) {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji is required." });
    }

    const msgDoc = await db.collection("messages").doc(id).get();
    if (!msgDoc.exists) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const msg = msgDoc.data();
    const reactions = msg.reactions || {};
    const userList = reactions[emoji] || [];

    let updatedUsers = [];
    if (userList.includes(req.user.id)) {
      // Remove reaction
      updatedUsers = userList.filter((uid) => uid !== req.user.id);
    } else {
      // Add reaction
      updatedUsers = [...userList, req.user.id];
    }

    if (updatedUsers.length > 0) {
      reactions[emoji] = updatedUsers;
    } else {
      delete reactions[emoji];
    }

    await db.collection("messages").doc(id).update({ reactions });

    return res.json({
      success: true,
      reactions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to toggle reaction.", error: error.message });
  }
}

// DELETE /api/chat/clear (Clear channel - Manager only)
async function clearChannel(req, res) {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Only Managers can clear channel history." });
    }
    const { channel = "general" } = req.body;
    const snapshot = await db.collection("messages").get();
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      if (data.channel === channel) {
        await db.collection("messages").doc(doc.id).delete();
      }
    });
    return res.json({ success: true, message: `Channel #${channel} cleared by Manager.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to clear channel.", error: error.message });
  }
}

module.exports = {
  getMessages,
  sendMessage,
  togglePinMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  clearChannel,
};
