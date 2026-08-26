import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { PulsingDot } from "../components/PulsingDot";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { Header } from "../components/Header";
import { COLORS } from "../theme/colors";

const CHANNELS = [
  { id: "general", label: "# general" },
  { id: "announcements", label: "# announcements" },
  { id: "dev-team", label: "# dev-team" },
];

const EMOJIS = ["👍", "🔥", "🚀", "❤️", "👏"];

export const ChatScreen = ({ onNavigateToProfile }) => {
  const { user, isManager } = useAuth();

  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [pinnedList, setPinnedList] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(true);

  // Message Action / Modal states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const flatListRef = useRef(null);

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await chatAPI.getMessages(activeChannel);
      if (res && res.messages) {
        setMessages(res.messages);
        setPinnedList(res.pinned || []);
      }
    } catch (err) {
      console.log("Chat fetch error:", err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial fetch and fast real-time polling sync (every 3 seconds)
  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText("");

    // Optimistic UI insert
    const tempId = "temp_" + Date.now();
    const optimisticMsg = {
      id: tempId,
      channel: activeChannel,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      userDepartment: user.department,
      text: textToSend,
      isAnnouncement: Boolean(isAnnouncement && isManager),
      isPinned: false,
      reactions: {},
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await chatAPI.sendMessage({
        text: textToSend,
        channel: activeChannel,
        isAnnouncement: Boolean(isAnnouncement && isManager),
      });
      setIsAnnouncement(false);
      fetchMessages(false);
    } catch (err) {
      console.log("Send message error:", err.message);
    }
  };

  const handleOpenActionModal = (msg) => {
    setSelectedMessage(msg);
    setActionModalVisible(true);
  };

  const handleTogglePin = async () => {
    if (!selectedMessage) return;
    try {
      await chatAPI.togglePin(selectedMessage.id);
      setActionModalVisible(false);
      fetchMessages(false);
    } catch (err) {
      console.log("Pin error:", err.message);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    try {
      await chatAPI.deleteMessage(selectedMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setActionModalVisible(false);
    } catch (err) {
      console.log("Delete error:", err.message);
    }
  };

  const handleStartEdit = () => {
    if (!selectedMessage) return;
    setEditText(selectedMessage.text);
    setIsEditing(true);
    setActionModalVisible(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedMessage || !editText.trim()) return;
    try {
      await chatAPI.editMessage(selectedMessage.id, editText.trim());
      setIsEditing(false);
      setSelectedMessage(null);
      fetchMessages(false);
    } catch (err) {
      console.log("Edit save error:", err.message);
    }
  };

  const handleReaction = async (emoji, msgId) => {
    try {
      await chatAPI.toggleReaction(msgId, emoji);
      fetchMessages(false);
    } catch (err) {
      console.log("Reaction error:", err.message);
    }
  };

  const renderMessageBubble = ({ item: msg }) => {
    const isMe = msg.userId === user?.id;
    const isMsgManager = msg.userRole === "manager";

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onLongPress={() => handleOpenActionModal(msg)}
        style={[
          styles.msgContainer,
          isMe ? styles.msgRight : styles.msgLeft,
        ]}
      >
        <View style={[styles.msgWrapper, isMe && styles.msgWrapperMe]}>
          {!isMe && (
            <Image source={{ uri: msg.userAvatar }} style={styles.msgAvatar} />
          )}

          <View style={{ flex: 1 }}>
            {/* Sender Header */}
            <View style={[styles.msgHeader, isMe && { justifyContent: "flex-end" }]}>
              <Text style={styles.msgUserName}>{msg.userName}</Text>
              <View
                style={[
                  styles.msgRoleBadge,
                  isMsgManager ? styles.msgRoleManager : styles.msgRoleEmployee,
                ]}
              >
                <Text
                  style={[
                    styles.msgRoleText,
                    { color: isMsgManager ? "#C4B5FD" : "#67E8F9" },
                  ]}
                >
                  {msg.userRole?.toUpperCase()}
                </Text>
              </View>
              {msg.isPinned && (
                <Text style={styles.pinnedIndicator}>📌 Pinned</Text>
              )}
              <Text style={styles.msgTimestamp}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>

            {/* Message Bubble Card */}
            <GlassCard
              style={[
                styles.msgBubble,
                isMe && styles.msgBubbleMe,
                msg.isAnnouncement && styles.msgBubbleAnnouncement,
              ]}
              variant={msg.isAnnouncement ? "amber" : isMe ? "primary" : "default"}
            >
              {msg.isAnnouncement && (
                <View style={styles.announcementBanner}>
                  <Text style={styles.announcementIcon}>📢</Text>
                  <Text style={styles.announcementTag}>TEAM BROADCAST</Text>
                </View>
              )}

              <Text style={[styles.msgText, isMe && styles.msgTextMe]}>
                {msg.text}
              </Text>

              {msg.isEdited && (
                <Text style={styles.editedTag}>
                  (edited {msg.editedByRole === "manager_moderator" ? "by Lead" : ""})
                </Text>
              )}
            </GlassCard>

            {/* Emoji Reactions Row */}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <View style={[styles.reactionsRow, isMe && { justifyContent: "flex-end" }]}>
                {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                  if (!userIds || userIds.length === 0) return null;
                  const reactedByMe = userIds.includes(user?.id);
                  return (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => handleReaction(emoji, msg.id)}
                      style={[
                        styles.reactionPill,
                        reactedByMe && styles.reactionPillActive,
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      <Text style={styles.reactionCount}>{userIds.length}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper scrollable={false} style={styles.container}>
      <Header onProfilePress={onNavigateToProfile} />

      {/* Top Channel Bar */}
      <View style={styles.channelBar}>
        {CHANNELS.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setActiveChannel(c.id)}
            style={[
              styles.channelTab,
              activeChannel === c.id && styles.channelTabActive,
            ]}
          >
            <Text
              style={[
                styles.channelLabel,
                activeChannel === c.id && styles.channelLabelActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pinned Messages Banner (If any) */}
      {pinnedList.length > 0 && (
        <GlassCard style={styles.pinnedCard} variant="amber">
          <View style={styles.pinnedRow}>
            <Text style={styles.pinnedIcon}>📌</Text>
            <View style={styles.pinnedContent}>
              <Text style={styles.pinnedTitle}>
                PINNED BY {pinnedList[0].pinnedBy || "MANAGER"}
              </Text>
              <Text style={styles.pinnedSnippet} numberOfLines={1}>
                {pinnedList[0].text}
              </Text>
            </View>
            {isManager && (
              <TouchableOpacity onPress={() => chatAPI.togglePin(pinnedList[0].id).then(() => fetchMessages(false))}>
                <Text style={styles.unpinBtn}>Unpin</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      )}

      {/* Chat Messages Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageBubble}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <GlassCard style={styles.emptyChatCard}>
            <Text style={styles.emptyChatIcon}>💬</Text>
            <Text style={styles.emptyChatTitle}>No messages in #{activeChannel}</Text>
            <Text style={styles.emptyChatDesc}>
              Be the first to start the team conversation!
            </Text>
          </GlassCard>
        }
      />

      {/* Manager Broadcast Toggle (Only if Manager) */}
      {isManager && (
        <View style={styles.managerControlsRow}>
          <TouchableOpacity
            onPress={() => setIsAnnouncement(!isAnnouncement)}
            style={[
              styles.announcementToggle,
              isAnnouncement && styles.announcementToggleActive,
            ]}
          >
            <Text style={styles.toggleIcon}>{isAnnouncement ? "📢" : "💬"}</Text>
            <Text style={[styles.toggleText, isAnnouncement && styles.toggleTextActive]}>
              {isAnnouncement ? "Announcement Mode ON" : "Normal Message (Tap for Announcement)"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Message Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <GlassCard style={styles.inputContainer} variant="primary">
          <TextInput
            style={styles.chatInput}
            placeholder={isAnnouncement ? "Type team broadcast..." : `Message #${activeChannel}...`}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={2}
          />
          <GlassButton
            title="Send ➔"
            onPress={handleSendMessage}
            variant="primary"
            size="sm"
            style={styles.sendBtn}
          />
        </GlassCard>
      </KeyboardAvoidingView>

      {/* Message Action & Moderation Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <GlassCard style={styles.modalBox} variant="primary">
            <Text style={styles.modalTitle}>Message Options</Text>
            <Text style={styles.modalSnippet} numberOfLines={2}>
              "{selectedMessage?.text}"
            </Text>

            {/* Quick Emoji Reaction Bar */}
            <View style={styles.modalEmojiRow}>
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    if (selectedMessage) {
                      handleReaction(emoji, selectedMessage.id);
                      setActionModalVisible(false);
                    }
                  }}
                  style={styles.modalEmojiBtn}
                >
                  <Text style={styles.modalEmojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionList}>
              {/* Manager Exclusive: Pin/Unpin */}
              {isManager && (
                <TouchableOpacity onPress={handleTogglePin} style={styles.modalActionItem}>
                  <Text style={styles.modalActionIcon}>📌</Text>
                  <Text style={styles.modalActionLabel}>
                    {selectedMessage?.isPinned ? "Unpin from Top" : "Pin Announcement to Top"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Edit (Author or Manager) */}
              {(isManager || selectedMessage?.userId === user?.id) && (
                <TouchableOpacity onPress={handleStartEdit} style={styles.modalActionItem}>
                  <Text style={styles.modalActionIcon}>✏️</Text>
                  <Text style={styles.modalActionLabel}>
                    {isManager && selectedMessage?.userId !== user?.id ? "Moderate / Edit Message" : "Edit Message"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Delete (Author or Manager) */}
              {(isManager || selectedMessage?.userId === user?.id) && (
                <TouchableOpacity onPress={handleDeleteMessage} style={styles.modalActionItem}>
                  <Text style={styles.modalActionIcon}>🗑️</Text>
                  <Text style={[styles.modalActionLabel, { color: "#FB7185" }]}>
                    {isManager && selectedMessage?.userId !== user?.id ? "Delete Message (Manager Power)" : "Delete Message"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Modal>

      {/* Inline Edit Modal */}
      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.editModalBox} variant="primary">
            <Text style={styles.modalTitle}>✏️ Edit Message</Text>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.editBtnRow}>
              <GlassButton
                title="Cancel"
                onPress={() => setIsEditing(false)}
                variant="glass"
                size="sm"
              />
              <GlassButton
                title="Save Changes"
                onPress={handleSaveEdit}
                variant="primary"
                size="sm"
              />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  channelBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  channelTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  channelTabActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: COLORS.primary,
  },
  channelLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  channelLabelActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  pinnedCard: {
    padding: 10,
    marginBottom: 10,
  },
  pinnedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinnedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  pinnedContent: {
    flex: 1,
  },
  pinnedTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.pending,
    letterSpacing: 0.5,
  },
  pinnedSnippet: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  unpinBtn: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  messageList: {
    paddingBottom: 20,
    gap: 12,
  },
  msgContainer: {
    width: "100%",
  },
  msgRight: {
    alignItems: "flex-end",
  },
  msgLeft: {
    alignItems: "flex-start",
  },
  msgWrapper: {
    flexDirection: "row",
    maxWidth: "88%",
    gap: 8,
  },
  msgWrapperMe: {
    flexDirection: "row-reverse",
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: 2,
  },
  msgHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  msgUserName: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  msgRoleBadge: {
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  msgRoleManager: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
  msgRoleEmployee: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },
  msgRoleText: {
    fontSize: 8,
    fontWeight: "900",
  },
  pinnedIndicator: {
    fontSize: 10,
    color: COLORS.pending,
    fontWeight: "700",
  },
  msgTimestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 14,
  },
  msgBubbleMe: {
    backgroundColor: "rgba(99, 102, 241, 0.20)",
    borderColor: "rgba(99, 102, 241, 0.4)",
  },
  msgBubbleAnnouncement: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  announcementBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  announcementIcon: {
    fontSize: 12,
  },
  announcementTag: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.pending,
    letterSpacing: 0.8,
  },
  msgText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  msgTextMe: {
    color: "#FFFFFF",
  },
  editedTag: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: "italic",
    marginTop: 4,
  },
  reactionsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 3,
  },
  reactionPillActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: COLORS.primary,
  },
  reactionEmoji: {
    fontSize: 11,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  managerControlsRow: {
    marginBottom: 6,
  },
  announcementToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignSelf: "flex-start",
    gap: 6,
  },
  announcementToggleActive: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderColor: COLORS.pending,
  },
  toggleIcon: {
    fontSize: 12,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.pending,
    fontWeight: "800",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    marginBottom: 60,
  },
  chatInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    paddingHorizontal: 10,
    maxHeight: 70,
  },
  sendBtn: {
    paddingHorizontal: 14,
  },
  emptyChatCard: {
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyChatIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyChatDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSnippet: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: 16,
  },
  modalEmojiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalEmojiBtn: {
    padding: 6,
  },
  modalEmojiText: {
    fontSize: 22,
  },
  modalActionList: {
    gap: 8,
  },
  modalActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 10,
  },
  modalActionIcon: {
    fontSize: 16,
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  editModalBox: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
  },
  editInput: {
    backgroundColor: "rgba(10, 15, 26, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginVertical: 14,
    minHeight: 80,
  },
  editBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
