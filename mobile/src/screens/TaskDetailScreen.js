import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { tasksAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ProgressBar } from "../components/ProgressBar";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { AnimatedCard } from "../components/AnimatedCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

export const TaskDetailScreen = ({
  taskId,
  onBack,
  onNavigateToAddUpdate,
}) => {
  const { user, isManager } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Blocker / Quick Action Modal
  const [blockerModalVisible, setBlockerModalVisible] = useState(false);
  const [blockerNote, setBlockerNote] = useState("");

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await tasksAPI.getTaskById(taskId);
      if (res && res.task) {
        setTask(res.task);
      }
    } catch (err) {
      console.log("Error fetching task detail:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleStatusChange = async (newStatus, note = "") => {
    if (task?.status === newStatus) return;
    try {
      setStatusUpdating(true);
      const res = await tasksAPI.updateStatus(taskId, newStatus, note);
      if (res.success && res.task) {
        setTask((prev) => ({
          ...prev,
          status: res.task.status,
          progress: res.task.progress,
          updates: res.auditLog ? [res.auditLog, ...(prev.updates || [])] : prev.updates,
        }));
        showNotification(
          newStatus === "Completed"
            ? "🎉 Awesome! Task marked as COMPLETED (100%)"
            : `Status updated to ${newStatus}`
        );
      }
    } catch (err) {
      console.log("Status update error:", err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReportBlocker = async () => {
    if (!blockerNote.trim()) return;
    setBlockerModalVisible(false);
    await handleStatusChange("Blocked", `🚨 Blocker: ${blockerNote.trim()}`);
    setBlockerNote("");
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await tasksAPI.addComment(taskId, commentText.trim());
      if (res.success && res.comment) {
        setTask((prev) => ({
          ...prev,
          comments: [res.comment, ...(prev.comments || [])],
        }));
        setCommentText("");
      }
    } catch (err) {
      console.log("Add comment error:", err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await tasksAPI.deleteTask(taskId);
      onBack();
    } catch (err) {
      console.log("Delete error:", err.message);
      onBack();
    }
  };

  if (!task) {
    return (
      <ScreenWrapper contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Tasks</Text>
        </TouchableOpacity>
        <GlassCard style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading task details...</Text>
        </GlassCard>
      </ScreenWrapper>
    );
  }

  const isComplete = task.status === "Completed" || task.progress >= 100;
  const isAssignedToMe = task.assignedToId === user?.id;

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </View>
      </View>

      {feedbackMsg ? (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      ) : null}

      {/* Completion Celebration Banner */}
      {isComplete && (
        <AnimatedCard delay={50}>
          <GlassCard style={styles.celebrationCard} variant="success" glow={true}>
            <View style={styles.celebrationRow}>
              <Text style={styles.celebrationIcon}>🏆</Text>
              <View style={styles.celebrationInfo}>
                <Text style={styles.celebrationTitle}>Task Completed & Delivered!</Text>
                <Text style={styles.celebrationDesc}>
                  100% progress verified. All work logs updated for managerial review.
                </Text>
              </View>
            </View>
          </GlassCard>
        </AnimatedCard>
      )}

      {/* Main Task Card */}
      <AnimatedCard delay={100}>
        <GlassCard style={styles.overviewCard} variant="primary" glow={true}>
          <View style={styles.categoryRow}>
            <Text style={styles.taskCategory}>{task.category || "TASK SPECIFICATION"}</Text>
            <UrgencyBadge deadline={task.deadline} />
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>

          {/* Progress Gauge */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={task.progress} height={8} />
          </View>

          {/* Meta specs */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>DEADLINE</Text>
              <Text style={styles.metaValue}>📅 {task.deadline}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>HOURS LOGGED</Text>
              <Text style={styles.metaValue}>⏱️ {task.totalHoursSpent || 0} hrs</Text>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Direct Employee Action Hub (I AM DONE / IN PROGRESS / BLOCKED) */}
      <AnimatedCard delay={150}>
        <GlassCard style={styles.employeeActionHub} variant={isComplete ? "success" : "primary"}>
          <Text style={styles.hubTitle}>
            {isAssignedToMe ? "⚡ Your Task Action Controls" : "👑 Team Workflow Controls"}
          </Text>
          <Text style={styles.hubSubtitle}>
            {isAssignedToMe
              ? "Update your progress directly so your manager sees your live status:"
              : "Directly manage or override sprint phase:"}
          </Text>

          {/* Primary Action Buttons */}
          <View style={styles.actionGrid}>
            {/* 1. I'm Done Button */}
            {!isComplete ? (
              <TouchableOpacity
                onPress={() => handleStatusChange("Completed")}
                disabled={statusUpdating}
                style={[styles.bigActionBtn, styles.completeActionBtn]}
              >
                <Text style={styles.actionBtnEmoji}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.completeBtnTitle}>I Have Completed This Task!</Text>
                  <Text style={styles.completeBtnSub}>Sets progress to 100% and notifies manager</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleStatusChange("In Progress")}
                disabled={statusUpdating}
                style={[styles.bigActionBtn, styles.reopenActionBtn]}
              >
                <Text style={styles.actionBtnEmoji}>↺</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reopenBtnTitle}>Re-Open Task (Back to In Progress)</Text>
                  <Text style={styles.reopenBtnSub}>Continue working or make revisions</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.secondaryActionRow}>
              {/* 2. In Progress */}
              {task.status !== "In Progress" && !isComplete && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("In Progress")}
                  style={[styles.smallActionBtn, styles.inProgressBtn]}
                >
                  <Text style={styles.smallActionText}>🚀 I'm On It (In Progress)</Text>
                </TouchableOpacity>
              )}

              {/* 3. Pending / Hold */}
              {task.status !== "Pending" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("Pending")}
                  style={[styles.smallActionBtn, styles.pendingBtn]}
                >
                  <Text style={styles.smallActionText}>⏳ Put On Hold (Pending)</Text>
                </TouchableOpacity>
              )}

              {/* 4. Blocker Flag */}
              <TouchableOpacity
                onPress={() => setBlockerModalVisible(true)}
                style={[styles.smallActionBtn, styles.blockerBtn]}
              >
                <Text style={[styles.smallActionText, { color: "#FB7185" }]}>
                  🚨 Report Blocker
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Add Work Update Button */}
      <AnimatedCard delay={200}>
        <View style={styles.buttonActionRow}>
          <GlassButton
            title="📝 Add Daily Progress Log"
            onPress={() => onNavigateToAddUpdate(task.id, task.title, task.progress)}
            variant="primary"
            size="lg"
            style={{ width: "100%" }}
          />

          {isManager && (
            <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteLink}>
              <Text style={styles.deleteLinkText}>🗑️ Delete This Task Assignment</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedCard>

      {/* People / Assignee info */}
      <AnimatedCard delay={250}>
        <View style={styles.peopleGrid}>
          <GlassCard style={styles.personCard}>
            <Text style={styles.personRoleLabel}>ASSIGNED ENGINEER</Text>
            <View style={styles.personRow}>
              <Image source={{ uri: task.assignedToAvatar }} style={styles.personAvatar} />
              <View>
                <Text style={styles.personName}>{task.assignedToName}</Text>
                <Text style={styles.personSub}>Responsible Engineer</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.personCard}>
            <Text style={styles.personRoleLabel}>ASSIGNED BY (MANAGER)</Text>
            <View style={styles.personRow}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }}
                style={styles.personAvatar}
              />
              <View>
                <Text style={styles.personName}>{task.createdByName || "Sarah Jenkins"}</Text>
                <Text style={styles.personSub}>Engineering & Product Lead</Text>
              </View>
            </View>
          </GlassCard>
        </View>
      </AnimatedCard>

      {/* Daily Work Updates Log Stream */}
      <AnimatedCard delay={300}>
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            📝 Daily Work Log History ({task.updates?.length || 0})
          </Text>

          {task.updates && task.updates.length > 0 ? (
            task.updates.map((update, idx) => (
              <GlassCard key={update.id || idx} style={styles.updateCard}>
                <View style={styles.updateTop}>
                  <View style={styles.updateUserRow}>
                    <Image source={{ uri: update.userAvatar }} style={styles.updateAvatar} />
                    <View>
                      <Text style={styles.updateUserName}>{update.userName}</Text>
                      <Text style={styles.updateTimestamp}>
                        {new Date(update.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressDiffPill}>
                    <Text style={styles.progressDiffText}>
                      {update.previousProgress}% ➔ {update.newProgress}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.updateNote}>"{update.note}"</Text>

                <View style={styles.updateFooter}>
                  <Text style={styles.updateHours}>⏱️ Logged: {update.hoursSpent || 0} hrs</Text>
                  {update.isBlocker && (
                    <Text style={styles.blockerTag}>⚠️ Blocker Encountered</Text>
                  )}
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.noUpdatesCard}>
              <Text style={styles.noUpdatesText}>No progress logs yet.</Text>
            </GlassCard>
          )}
        </View>
      </AnimatedCard>

      {/* Team Comments */}
      <AnimatedCard delay={350}>
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            💬 Team Discussion ({task.comments?.length || 0})
          </Text>

          <GlassCard style={styles.addCommentCard}>
            <TextInput
              style={styles.commentInput}
              placeholder="Ask clarifying questions or leave feedback..."
              placeholderTextColor={COLORS.textMuted}
              value={commentText}
              onChangeText={setCommentText}
            />
            <GlassButton
              title="Post"
              onPress={handleAddComment}
              loading={submittingComment}
              variant="primary"
              size="sm"
            />
          </GlassCard>

          {task.comments && task.comments.length > 0 ? (
            task.comments.map((c) => (
              <GlassCard key={c.id} style={styles.commentItemCard}>
                <View style={styles.commentHeader}>
                  <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} />
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>
                      {c.userName} {c.userRole === "manager" ? "👑 (Lead)" : ""}
                    </Text>
                    <Text style={styles.commentTime}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentBody}>{c.text}</Text>
              </GlassCard>
            ))
          ) : null}
        </View>
      </AnimatedCard>

      {/* Blocker Reporting Modal */}
      <Modal
        visible={blockerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBlockerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalBox} variant="danger">
            <Text style={styles.modalTitle}>🚨 Report a Blocker</Text>
            <Text style={styles.modalSub}>
              Describe what is blocking you so the manager can assist immediately:
            </Text>
            <TextInput
              style={styles.blockerInput}
              placeholder="e.g. Waiting on API credentials, third-party library error..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={blockerNote}
              onChangeText={setBlockerNote}
            />
            <View style={styles.modalBtnRow}>
              <GlassButton
                title="Cancel"
                onPress={() => setBlockerModalVisible(false)}
                variant="glass"
                size="sm"
              />
              <GlassButton
                title="🚨 Flag Blocker"
                onPress={handleReportBlocker}
                variant="danger"
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
  container: { paddingBottom: 60 },
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(255, 255, 255, 0.06)", borderWidth: 1, borderColor: COLORS.glassBorder },
  backBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  badgeRow: { flexDirection: "row", gap: 8 },
  feedbackBanner: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.35)", padding: 12, borderRadius: 12, marginBottom: 16 },
  feedbackText: { color: "#6EE7B7", fontSize: 13, fontWeight: "700", textAlign: "center" },
  celebrationCard: { padding: 16, marginBottom: 16 },
  celebrationRow: { flexDirection: "row", alignItems: "center" },
  celebrationIcon: { fontSize: 32, marginRight: 12 },
  celebrationInfo: { flex: 1 },
  celebrationTitle: { fontSize: 16, fontWeight: "900", color: COLORS.completed },
  celebrationDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  overviewCard: { padding: 20, marginBottom: 16 },
  categoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  taskCategory: { fontSize: 11, fontWeight: "800", color: COLORS.primary, letterSpacing: 1 },
  taskTitle: { fontSize: 22, fontWeight: "900", color: COLORS.textPrimary, marginBottom: 8, lineHeight: 28 },
  taskDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  progressContainer: { marginBottom: 16 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.08)" },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: "800", color: COLORS.textPrimary },
  employeeActionHub: { padding: 16, marginBottom: 16 },
  hubTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textPrimary, marginBottom: 2 },
  hubSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 },
  actionGrid: { gap: 10 },
  bigActionBtn: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  completeActionBtn: { backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: COLORS.completed },
  reopenActionBtn: { backgroundColor: "rgba(99, 102, 241, 0.2)", borderColor: COLORS.primary },
  actionBtnEmoji: { fontSize: 24 },
  completeBtnTitle: { fontSize: 15, fontWeight: "900", color: COLORS.completed },
  completeBtnSub: { fontSize: 11, color: "rgba(255, 255, 255, 0.7)", marginTop: 2 },
  reopenBtnTitle: { fontSize: 14, fontWeight: "800", color: "#A5B4FC" },
  reopenBtnSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  secondaryActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  smallActionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, borderColor: COLORS.glassBorder },
  inProgressBtn: { backgroundColor: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.35)" },
  pendingBtn: { backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" },
  blockerBtn: { backgroundColor: "rgba(244, 63, 94, 0.12)", borderColor: "rgba(244, 63, 94, 0.35)" },
  smallActionText: { fontSize: 12, fontWeight: "700", color: COLORS.textPrimary },
  buttonActionRow: { marginBottom: 20, gap: 8 },
  deleteLink: { alignItems: "center", paddingVertical: 6 },
  deleteLinkText: { fontSize: 12, color: "#FB7185", fontWeight: "700" },
  peopleGrid: { gap: 12, marginBottom: 20 },
  personCard: { padding: 14 },
  personRoleLabel: { fontSize: 10, fontWeight: "800", color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 8 },
  personRow: { flexDirection: "row", alignItems: "center" },
  personAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
  personName: { fontSize: 14, fontWeight: "800", color: COLORS.textPrimary },
  personSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  section: { marginBottom: 20 },
  sectionHeading: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 12 },
  updateCard: { padding: 14, marginBottom: 10 },
  updateTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  updateUserRow: { flexDirection: "row", alignItems: "center" },
  updateAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  updateUserName: { fontSize: 13, fontWeight: "800", color: COLORS.textPrimary },
  updateTimestamp: { fontSize: 10, color: COLORS.textMuted },
  progressDiffPill: { backgroundColor: "rgba(16, 185, 129, 0.12)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.35)", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  progressDiffText: { fontSize: 10, color: COLORS.completed, fontWeight: "800" },
  updateNote: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 18, marginBottom: 8 },
  updateFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.06)" },
  updateHours: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  blockerTag: { fontSize: 11, color: "#FB7185", fontWeight: "700" },
  noUpdatesCard: { padding: 20, alignItems: "center" },
  noUpdatesText: { fontSize: 13, color: COLORS.textSecondary },
  addCommentCard: { flexDirection: "row", alignItems: "center", padding: 8, marginBottom: 10, gap: 8 },
  commentInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, color: COLORS.textPrimary, fontSize: 13 },
  commentItemCard: { padding: 12, marginBottom: 8 },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  commentAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  commentMeta: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentAuthor: { fontSize: 12, fontWeight: "700", color: COLORS.textPrimary },
  commentTime: { fontSize: 10, color: COLORS.textMuted },
  commentBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { width: "100%", maxWidth: 420, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#FB7185", marginBottom: 4 },
  modalSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },
  blockerInput: { backgroundColor: "rgba(10, 15, 26, 0.8)", borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 12, padding: 12, color: COLORS.textPrimary, fontSize: 13, marginBottom: 16, minHeight: 70 },
  modalBtnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  loadingCard: { padding: 40, alignItems: "center" },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
});
