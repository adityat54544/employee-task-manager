import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
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
import { Header } from "../components/Header";
import { COLORS } from "../theme/colors";

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Completed"];
const PRIORITY_FILTERS = ["All", "High", "Medium", "Low"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "🔥 Priority", value: "priority_desc" },
  { label: "📅 Deadline", value: "deadline_asc" },
  { label: "⚡ Progress", value: "progress_desc" },
];

export const TasksScreen = ({
  onNavigateToTaskDetail,
  onNavigateToCreateTask,
  onNavigateToProfile,
}) => {
  const { user, isManager, demoProfiles } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedAssignee, setSelectedAssignee] = useState("All");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      if (selectedPriority !== "All") params.priority = selectedPriority;
      if (selectedAssignee !== "All") params.assignedToId = selectedAssignee;
      if (selectedSort) params.sort = selectedSort;
      if (searchQuery) params.search = searchQuery;

      const res = await tasksAPI.getTasks(params);
      if (res && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.log("Error fetching tasks:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus, selectedPriority, selectedAssignee, selectedSort, searchQuery, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleQuickStatusTransition = async (task) => {
    const nextStatusMap = {
      Pending: "In Progress",
      "In Progress": "Completed",
      Completed: "Pending",
    };
    const nextStatus = nextStatusMap[task.status] || "In Progress";
    try {
      await tasksAPI.updateStatus(task.id, nextStatus);
      fetchTasks();
    } catch (err) {
      console.log("Quick status toggle error:", err.message);
    }
  };

  const renderTaskCard = ({ item: t, index }) => (
    <AnimatedCard delay={index * 60}>
      <GlassCard
        style={styles.taskCard}
        onPress={() => onNavigateToTaskDetail(t.id)}
        variant={t.priority === "High" ? "danger" : "default"}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.badgeRow}>
            <PriorityBadge priority={t.priority} size="sm" />
            <StatusBadge status={t.status} size="sm" />
          </View>
          <UrgencyBadge deadline={t.deadline} />
        </View>

        <Text style={styles.taskTitle}>{t.title}</Text>
        <Text style={styles.taskDesc} numberOfLines={2}>
          {t.description}
        </Text>

        <ProgressBar progress={t.progress} height={6} style={styles.progressBar} />

        <View style={styles.cardFooter}>
          <View style={styles.assigneeContainer}>
            <Image
              source={{ uri: t.assignedToAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }}
              style={styles.assigneeAvatar}
            />
            <View>
              <Text style={styles.assigneeLabel}>Assigned to</Text>
              <Text style={styles.assigneeName}>{t.assignedToName}</Text>
            </View>
          </View>

          <View style={styles.footerRight}>
            <TouchableOpacity
              onPress={() => handleQuickStatusTransition(t)}
              style={styles.quickStatusBtn}
            >
              <Text style={styles.quickStatusText}>
                {t.status === "Pending" ? "Start ➔" : t.status === "In Progress" ? "Complete ✓" : "Re-open ↺"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    </AnimatedCard>
  );

  return (
    <ScreenWrapper scrollable={false} style={styles.wrapper}>
      <Header onProfilePress={onNavigateToProfile} />

      {/* Title & Add Action Row */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.pageTitle}>
            {isManager ? "Team Tasks & Sprints" : "My Task Queue"}
          </Text>
          <Text style={styles.pageSubtitle}>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} matched
          </Text>
        </View>

        {isManager && (
          <GlassButton
            title="+ New Task"
            onPress={onNavigateToCreateTask}
            variant="primary"
            size="sm"
          />
        )}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks, assignees, keywords..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter Tab Pills */}
      <View style={styles.filterScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: status }) => {
            const isActive = selectedStatus === status;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(status)}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort & Assignee Filter Row */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSelectedSort(opt.value)}
            style={[
              styles.sortChip,
              selectedSort === opt.value && styles.sortChipActive,
            ]}
          >
            <Text
              style={[
                styles.sortChipText,
                selectedSort === opt.value && styles.sortChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery || selectedStatus !== "All"
                ? "Try adjusting your filters or search keywords"
                : isManager
                ? "Click '+ New Task' above to assign your first task"
                : "You're all caught up! No active tasks assigned"}
            </Text>
            {(searchQuery || selectedStatus !== "All" || selectedPriority !== "All") && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                  setSelectedPriority("All");
                  setSelectedSort("newest");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 26, 0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
    padding: 6,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterList: {
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: "800",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 6,
  },
  sortLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginRight: 2,
  },
  sortChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sortChipActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: COLORS.primary,
  },
  sortChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  sortChipTextActive: {
    color: "#A5B4FC",
    fontWeight: "800",
  },
  taskList: {
    paddingBottom: 80,
    gap: 12,
  },
  taskCard: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBar: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  assigneeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  assigneeName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickStatusBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.35)",
  },
  quickStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A5B4FC",
  },
  emptyCard: {
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  resetBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
