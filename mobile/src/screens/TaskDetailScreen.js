import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { tasksAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ProgressBar } from "../components/ProgressBar";
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
      // Local optimistic fallback
      setTask((prev) => ({
        ...prev,
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : newStatus === "Pending" ? 0 : Math.max(prev.progress, 15),
      }));
    } finally {
      setStatusUpdating(false);
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

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Header & Back Button */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </View>
      </View>

      {/* Main Task Overview Card */}
      <GlassCard style={styles.overviewCard} variant="primary" glow={true}>
        <Text style={styles.taskCategory}>{task.category || "TASK SPECIFICATION"}</Text>
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
            <Text style={styles.metaLabel}>HOURS LOGGED</Text>
            <Text style={styles.metaValue}>⏱️ {task.totalHoursSpent || 0} Hours</Text>
          </View>
        </View>
      </GlassCard>

      {/* Interactive Status Transition Stepper */}
      <GlassCard style={styles.stepperCard}>
        <Text style={styles.sectionHeading}>🔄 Workflow Status Transition</Text>
        <Text style={styles.sectionSub}>
          Tap any phase below to update task status in real time:
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

      {/* Assignee & Manager Details */}
      <View style={styles.peopleGrid}>
        {/* Assignee */}
        <GlassCard style={styles.personCard}>
          <Text style={styles.personRoleLabel}>ASSIGNED EMPLOYEE</Text>
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
              <Text style={styles.personSub}>Product & Tech Lead</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Primary Action Button: Add Daily Work Update */}
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
            <Text style={styles.deleteLinkText}>🗑️ Delete This Task</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Historical Daily Work Updates Stream */}
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
  overviewCard: {
    padding: 20,
    marginBottom: 16,
  },
  taskCategory: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 6,
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
    borderTopColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 6,
  },
  stepBtnActive: {
    backgroundColor: "rgba(6, 182, 212, 0.25)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    marginBottom: 20,
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
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
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
  loadingCard: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
