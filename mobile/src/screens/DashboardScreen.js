import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI, tasksAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ProgressBar } from "../components/ProgressBar";
import { PulsingDot } from "../components/PulsingDot";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { AnimatedCard } from "../components/AnimatedCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { Header } from "../components/Header";
import { COLORS, GRADIENTS } from "../theme/colors";

export const DashboardScreen = ({
  onNavigateToTasks,
  onNavigateToTaskDetail,
  onNavigateToCreateTask,
  onNavigateToProfile,
}) => {
  const { user, isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboardStats().catch(() => null),
        tasksAPI.getTasks().catch(() => null),
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      } else {
        setStats({
          totalTasks: 5,
          pendingTasks: 2,
          inProgressTasks: 2,
          completedTasks: 1,
          highPriorityTasks: 2,
          completionRate: 20,
          totalHoursLogged: 17.5,
          recentActivity: [],
          teamBreakdown: [],
        });
      }

      if (tasksRes && tasksRes.tasks) {
        setRecentTasks(tasksRes.tasks.slice(0, 3));
      }
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <ScreenWrapper
      scrollable={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.container}
    >
      <Header onProfilePress={onNavigateToProfile} />

      {/* Hero Performance Overview Card with Animated Stagger */}
      <AnimatedCard delay={100}>
        <GlassCard style={styles.heroCard} variant="primary" glow={true}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <View style={styles.heroBadgeRow}>
                <PulsingDot color={COLORS.primary} size={6} />
                <Text style={styles.heroSubtitle}>
                  {isManager ? "EXECUTIVE SPRINT OVERVIEW" : "PERSONAL PERFORMANCE DASHBOARD"}
                </Text>
              </View>
              <Text style={styles.heroTitle}>
                {stats?.completionRate || 0}% Completion Rate
              </Text>
              <Text style={styles.heroDesc}>
                {isManager
                  ? "Track team delivery timelines, milestone logs & productivity"
                  : "Keep momentum going on active assigned sprints"}
              </Text>
            </View>
            <View style={styles.ringContainer}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.rateCircle}
              >
                <Text style={styles.ratePercent}>{stats?.completionRate || 0}%</Text>
                <Text style={styles.rateLabel}>Done</Text>
              </LinearGradient>
            </View>
          </View>

          <ProgressBar
            progress={stats?.completionRate || 0}
            height={6}
            showLabel={false}
            style={styles.heroBar}
          />
        </GlassCard>
      </AnimatedCard>

      {/* Grid of Key Psychological Metric Cards */}
      <AnimatedCard delay={200}>
        <View style={styles.statsGrid}>
          {/* Total Tasks */}
          <GlassCard style={styles.statBox} variant="default">
            <View style={styles.statIconBadge}>
              <Text style={styles.statIcon}>📋</Text>
            </View>
            <Text style={styles.statValue}>{stats?.totalTasks ?? 0}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </GlassCard>

          {/* In Progress */}
          <GlassCard style={styles.statBox} variant="primary">
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(6, 182, 212, 0.15)" }]}>
              <Text style={styles.statIcon}>⚡</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.inProgress }]}>
              {stats?.inProgressTasks ?? 0}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </GlassCard>

          {/* Pending */}
          <GlassCard style={styles.statBox} variant="amber">
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
              <Text style={styles.statIcon}>⏳</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.pending }]}>
              {stats?.pendingTasks ?? 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </GlassCard>

          {/* Completed */}
          <GlassCard style={styles.statBox} variant="success">
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Text style={styles.statIcon}>✓</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.completed }]}>
              {stats?.completedTasks ?? 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </GlassCard>
        </View>
      </AnimatedCard>

      {/* Manager Action Quick Trigger */}
      {isManager && (
        <AnimatedCard delay={250}>
          <View style={styles.managerActionRow}>
            <GlassButton
              title="+ Assign New Task to Team"
              onPress={onNavigateToCreateTask}
              variant="primary"
              size="lg"
              style={styles.assignBtn}
            />
          </View>
        </AnimatedCard>
      )}

      {/* Manager's Team Productivity Breakdown */}
      {isManager && stats?.teamBreakdown && stats.teamBreakdown.length > 0 && (
        <AnimatedCard delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 Team Workload & Velocity</Text>
            </View>

            <View style={styles.teamList}>
              {stats.teamBreakdown.map((emp) => (
                <GlassCard key={emp.id} style={styles.teamCard}>
                  <View style={styles.teamRow}>
                    <Image source={{ uri: emp.avatar }} style={styles.teamAvatar} />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{emp.name}</Text>
                      <Text style={styles.teamDept}>{emp.department}</Text>
                    </View>
                    <View style={styles.teamScore}>
                      <Text style={styles.teamScoreText}>{emp.completionRate}%</Text>
                      <Text style={styles.teamScoreLabel}>
                        {emp.completedTasks}/{emp.totalTasks} Sprints Done
                      </Text>
                    </View>
                  </View>
                  <ProgressBar
                    progress={emp.completionRate}
                    height={5}
                    showLabel={false}
                    style={styles.teamBar}
                  />
                </GlassCard>
              ))}
            </View>
          </View>
        </AnimatedCard>
      )}

      {/* Recent Tasks List Preview */}
      <AnimatedCard delay={350}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isManager ? "📌 Active Team Sprints" : "🎯 My Current Tasks"}
            </Text>
            <TouchableOpacity onPress={onNavigateToTasks}>
              <Text style={styles.viewAllText}>View All ➔</Text>
            </TouchableOpacity>
          </View>

          {recentTasks.map((t) => (
            <GlassCard
              key={t.id}
              style={styles.taskCard}
              onPress={() => onNavigateToTaskDetail(t.id)}
            >
              <View style={styles.taskHeader}>
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

              <ProgressBar progress={t.progress} height={6} style={styles.taskProgressBar} />

              <View style={styles.taskFooter}>
                <View style={styles.assigneeRow}>
                  <Image
                    source={{ uri: t.assignedToAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }}
                    style={styles.assigneeAvatar}
                  />
                  <Text style={styles.assigneeName}>{t.assignedToName}</Text>
                </View>
                <Text style={styles.hoursText}>⏱️ {t.totalHoursSpent || 0} hrs logged</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </AnimatedCard>

      {/* Recent Activity Timeline Feed */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <AnimatedCard delay={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Live Team Work Updates</Text>
            </View>

            {stats.recentActivity.map((act) => (
              <GlassCard key={act.id} style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <Image source={{ uri: act.userAvatar }} style={styles.activityAvatar} />
                  <View style={styles.activityInfo}>
                    <View style={styles.activityTop}>
                      <Text style={styles.activityUser}>{act.userName}</Text>
                      <Text style={styles.activityTime}>
                        {new Date(act.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text style={styles.activityTaskTitle}>{act.taskTitle}</Text>
                    <Text style={styles.activityNote}>"{act.note}"</Text>
                    <View style={styles.activityMetaRow}>
                      <Text style={styles.activityProgressPill}>
                        {act.previousProgress}% ➔ {act.newProgress}%
                      </Text>
                      <Text style={styles.activityHoursPill}>+{act.hoursSpent} hrs logged</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        </AnimatedCard>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  heroCard: {
    marginBottom: 20,
    padding: 20,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  ringContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  rateCircle: {
    flex: 1,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
  },
  ratePercent: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },
  rateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
  },
  heroBar: {
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    width: "48%",
    padding: 16,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  managerActionRow: {
    marginBottom: 20,
  },
  assignBtn: {
    width: "100%",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
  },
  teamList: {
    gap: 10,
  },
  teamCard: {
    padding: 14,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  teamDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  teamScore: {
    alignItems: "flex-end",
  },
  teamScoreText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.completed,
  },
  teamScoreLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  teamBar: {
    marginTop: 10,
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
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
  taskProgressBar: {
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  assigneeName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  hoursText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  activityCard: {
    padding: 14,
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: "row",
  },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginTop: 2,
  },
  activityInfo: {
    flex: 1,
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  activityTaskTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  activityNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 17,
    marginBottom: 6,
  },
  activityMetaRow: {
    flexDirection: "row",
    gap: 8,
  },
  activityProgressPill: {
    fontSize: 11,
    color: COLORS.completed,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontWeight: "800",
  },
  activityHoursPill: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontWeight: "600",
  },
});
