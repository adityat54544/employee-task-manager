import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
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

const STATUS_STEPS = ["Pending", "In Progress", "Completed"];

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
  const [copiedFeedback, setCopiedFeedback] = useState("");

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

  const handleStatusChange = async (newStatus) => {
    if (task?.status === newStatus) return;
    try {
      setStatusUpdating(true);
      const res = await tasksAPI.updateStatus(taskId, newStatus);
      if (res.success && res.task) {
        setTask((prev) => ({
          ...prev,
          status: res.task.status,
          progress: res.task.progress,
        }));
      }
    } catch (err) {
      console.log("Status update error:", err.message);
      setTask((prev) => ({
        ...prev,
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : newStatus === "Pending" ? 0 : Math.max(prev.progress, 15),
      }));
    } finally {
      setStatusUpdating(false);
    }
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
      // Optimistic local comment
      const newLocal = {
        id: "local_" + Date.now(),
        userName: user.name,
        userAvatar: user.avatar,
        userRole: user.role,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      };
      setTask((prev) => ({
        ...prev,
        comments: [newLocal, ...(prev.comments || [])],
      }));
      setCommentText("");
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

      {/* Completion Celebration Banner */}
      {isComplete && (
        <AnimatedCard delay={50}>
          <GlassCard style={styles.celebrationCard} variant="success" glow={true}>
            <View style={styles.celebrationRow}>
              <Text style={styles.celebrationIcon}>🏆</Text>
              <View style={styles.celebrationInfo}>
                <Text style={styles.celebrationTitle}>Sprint Milestone Completed!</Text>
                <Text style={styles.celebrationDesc}>
                  100% progress verified. All work update logs delivered on time.
                </Text>
              </View>
            </View>
          </GlassCard>
        </AnimatedCard>
      )}

      {/* Main Task Overview Card */}
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

          {/* Deadline & Logged Hours */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TARGET DEADLINE</Text>
              <Text style={styles.metaValue}>📅 {task.deadline}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>TOTAL HOURS LOGGED</Text>
              <Text style={styles.metaValue}>⏱️ {task.totalHoursSpent || 0} Hours</Text>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Interactive Status Transition Stepper */}
      <AnimatedCard delay={150}>
        <GlassCard style={styles.stepperCard}>
          <Text style={styles.sectionHeading}>🔄 Workflow Status Transition</Text>
          <Text style={styles.sectionSub}>
            Tap any phase below to transition status in real-time:
          </Text>

          <View style={styles.stepperRow}>
            {STATUS_STEPS.map((step, idx) => {
              const isCurrent = task.status.toLowerCase() === step.toLowerCase();
              return (
                <TouchableOpacity
                  key={step}
                  disabled={statusUpdating}
                  onPress={() => handleStatusChange(step)}
                  style={[
                    styles.stepBtn,
                    isCurrent && styles.stepBtnActive,
                    step === "Completed" && isCurrent && styles.stepBtnCompleted,
                  ]}
                >
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                  <Text
                    style={[
                      styles.stepText,
                      isCurrent && styles.stepTextActive,
                    ]}
                  >
                    {step}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Assignee & Manager Details */}
      <AnimatedCard delay={200}>
        <View style={styles.peopleGrid}>
          {/* Assignee */}
          <GlassCard style={styles.personCard}>
            <Text style={styles.personRoleLabel}>ASSIGNED ENGINEER</Text>
            <View style={styles.personRow}>
              <Image
                source={{ uri: task.assignedToAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }}
                style={styles.personAvatar}
              />
              <View>
                <Text style={styles.personName}>{task.assignedToName}</Text>
                <Text style={styles.personSub}>Responsible Engineer</Text>
              </View>
            </View>
          </GlassCard>

          {/* Manager */}
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

      {/* Primary Action Button: Add Daily Work Update */}
      <AnimatedCard delay={250}>
        <View style={styles.actionSection}>
          <GlassButton
            title="⚡ Add Daily Work Update"
            onPress={() => onNavigateToAddUpdate(task.id, task.title, task.progress)}
            variant="primary"
            size="lg"
            style={styles.addUpdateBtn}
          />

          {isManager && (
            <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteLink}>
              <Text style={styles.deleteLinkText}>🗑️ Delete This Task Assignment</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedCard>

      {/* Historical Daily Work Updates Stream */}
      <AnimatedCard delay={300}>
        <View style={styles.updatesSection}>
          <View style={styles.updatesSectionHeader}>
            <Text style={styles.sectionHeading}>
              📝 Daily Work Updates History ({task.updates?.length || 0})
            </Text>
          </View>

          {task.updates && task.updates.length > 0 ? (
            task.updates.map((update, index) => (
              <GlassCard key={update.id || index} style={styles.updateCard}>
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
                  <Text style={styles.updateHours}>⏱️ Logged: {update.hoursSpent} hrs</Text>
                  {update.isBlocker && (
                    <Text style={styles.blockerTag}>⚠️ Blocker Encountered</Text>
                  )}
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.noUpdatesCard}>
              <Text style={styles.noUpdatesText}>
                No daily updates logged yet for this task.
              </Text>
              <Text style={styles.noUpdatesSub}>
                Tap "Add Daily Work Update" above to log today's progress!
              </Text>
            </GlassCard>
          )}
        </View>
      </AnimatedCard>

      {/* Team Discussion & Feedback Comments */}
      <AnimatedCard delay={350}>
        <View style={styles.commentsSection}>
          <Text style={styles.sectionHeading}>
            💬 Team Discussion & Review ({task.comments?.length || 0})
          </Text>

          {/* Add Comment Input */}
          <GlassCard style={styles.addCommentCard}>
            <TextInput
              style={styles.commentInput}
              placeholder="Leave feedback or ask a clarifying question..."
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
              style={styles.postCommentBtn}
            />
          </GlassCard>

          {/* Comments List */}
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  celebrationCard: {
    padding: 16,
    marginBottom: 16,
  },
  celebrationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  celebrationIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  celebrationInfo: {
    flex: 1,
  },
  celebrationTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.completed,
  },
  celebrationDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overviewCard: {
    padding: 20,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskCategory: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
  },
  taskDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  stepperCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 6,
  },
  stepBtnActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: COLORS.primary,
  },
  stepBtnCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderColor: COLORS.completed,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.textSecondary,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    lineHeight: 18,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  stepTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  peopleGrid: {
    gap: 12,
    marginBottom: 20,
  },
  personCard: {
    padding: 14,
  },
  personRoleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  personName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  personSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionSection: {
    marginBottom: 24,
    gap: 12,
  },
  addUpdateBtn: {
    width: "100%",
  },
  deleteLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  deleteLinkText: {
    fontSize: 12,
    color: "#FB7185",
    fontWeight: "700",
  },
  updatesSection: {
    marginBottom: 24,
  },
  updatesSectionHeader: {
    marginBottom: 12,
  },
  updateCard: {
    padding: 16,
    marginBottom: 12,
  },
  updateTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  updateUserRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  updateUserName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  updateTimestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressDiffPill: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressDiffText: {
    fontSize: 11,
    color: COLORS.completed,
    fontWeight: "800",
  },
  updateNote: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    marginBottom: 10,
  },
  updateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  updateHours: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  blockerTag: {
    fontSize: 11,
    color: "#FB7185",
    fontWeight: "700",
  },
  noUpdatesCard: {
    padding: 24,
    alignItems: "center",
  },
  noUpdatesText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  noUpdatesSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  commentsSection: {
    marginBottom: 20,
  },
  addCommentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  postCommentBtn: {
    paddingHorizontal: 14,
  },
  commentItemCard: {
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentMeta: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  commentTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  commentBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  loadingCard: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
