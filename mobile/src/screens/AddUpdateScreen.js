import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { updatesAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

const PROGRESS_PRESETS = [25, 50, 75, 100];

export const AddUpdateScreen = ({
  taskId,
  taskTitle,
  initialProgress = 0,
  onBack,
  onUpdateSubmitted,
}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(initialProgress);
  const [hoursSpent, setHoursSpent] = useState(2.0);
  const [note, setNote] = useState("");
  const [isBlocker, setIsBlocker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!note.trim()) {
      setErrorMsg("Please describe the work completed today.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await updatesAPI.addWorkUpdate(taskId, {
        note: note.trim(),
        progress: Number(progress),
        hoursSpent: Number(hoursSpent),
        isBlocker: Boolean(isBlocker),
      });

      if (res.success) {
        onUpdateSubmitted();
      } else {
        setErrorMsg(res.message || "Failed to submit work log.");
      }
    } catch (err) {
      console.log("Submit work update error:", err.message);
      // Optimistic callback
      onUpdateSubmitted();
    } finally {
      setLoading(false);
    }
  };

  const adjustHours = (delta) => {
    setHoursSpent((prev) => Math.max(0.5, Math.min(24, Math.round((prev + delta) * 10) / 10)));
  };

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Work Log</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Target Task Summary Card */}
      <GlassCard style={styles.taskBanner} variant="primary">
        <Text style={styles.bannerSubtitle}>LOGGING PROGRESS FOR</Text>
        <Text style={styles.bannerTaskTitle}>{taskTitle || "Active Task"}</Text>
      </GlassCard>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      {/* Progress Adjustment Section */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Update Task Progress (%)</Text>
        <Text style={styles.sectionSub}>
          Select progress milestone or adjust manually
        </Text>

        <View style={styles.presetRow}>
          {PROGRESS_PRESETS.map((pct) => (
            <TouchableOpacity
              key={pct}
              onPress={() => setProgress(pct)}
              style={[
                styles.presetBtn,
                progress === pct && styles.presetBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  progress === pct && styles.presetBtnTextActive,
                ]}
              >
                {pct}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.progressAdjustRow}>
          <TouchableOpacity
            onPress={() => setProgress((p) => Math.max(0, p - 5))}
            style={styles.stepCircle}
          >
            <Text style={styles.stepCircleText}>-5%</Text>
          </TouchableOpacity>

          <View style={styles.progressDisplay}>
            <Text style={styles.progressHugeText}>{progress}%</Text>
            <Text style={styles.progressHugeLabel}>COMPLETED</Text>
          </View>

          <TouchableOpacity
            onPress={() => setProgress((p) => Math.min(100, p + 5))}
            style={styles.stepCircle}
          >
            <Text style={styles.stepCircleText}>+5%</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar progress={progress} height={8} showLabel={false} style={styles.barPreview} />
      </GlassCard>

      {/* Hours Logged Counter */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. Hours Spent Today</Text>
        <View style={styles.hoursRow}>
          <TouchableOpacity onPress={() => adjustHours(-0.5)} style={styles.hourBtn}>
            <Text style={styles.hourBtnText}>- 0.5h</Text>
          </TouchableOpacity>

          <View style={styles.hoursDisplay}>
            <Text style={styles.hoursNumber}>{hoursSpent.toFixed(1)}</Text>
            <Text style={styles.hoursUnit}>Hours Logged</Text>
          </View>

          <TouchableOpacity onPress={() => adjustHours(0.5)} style={styles.hourBtn}>
            <Text style={styles.hourBtnText}>+ 0.5h</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Detailed Work Notes */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. What did you accomplish today?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., Implemented authentication screens, styled glassmorphic buttons, connected JWT endpoint and ran tests..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={note}
          onChangeText={setNote}
        />

        {/* Blocker Flag Toggle */}
        <View style={styles.blockerRow}>
          <View style={styles.blockerInfo}>
            <Text style={styles.blockerTitle}>Are you facing any blocker?</Text>
            <Text style={styles.blockerSub}>Flags this task for manager assistance</Text>
          </View>
          <Switch
            value={isBlocker}
            onValueChange={setIsBlocker}
            trackColor={{ false: "#334155", true: "#F43F5E" }}
            thumbColor={isBlocker ? "#FFFFFF" : "#94A3B8"}
          />
        </View>
      </GlassCard>

      {/* Submit Button */}
      <GlassButton
        title="🚀 Submit Daily Work Log"
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        variant="primary"
        style={styles.submitBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  taskBanner: {
    padding: 16,
    marginBottom: 16,
  },
  bannerSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTaskTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  errorBox: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FB7185",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  presetBtnActive: {
    backgroundColor: "rgba(6, 182, 212, 0.25)",
    borderColor: COLORS.primary,
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  presetBtnTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  progressAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  progressDisplay: {
    alignItems: "center",
  },
  progressHugeText: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressHugeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  barPreview: {
    marginTop: 10,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  hourBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  hourBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  hoursDisplay: {
    alignItems: "center",
  },
  hoursNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  hoursUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  textArea: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 90,
    marginBottom: 16,
  },
  blockerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  blockerInfo: {
    flex: 1,
    paddingRight: 10,
  },
  blockerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  blockerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  submitBtn: {
    marginTop: 10,
  },
});
