import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { tasksAPI, authAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

const PRIORITIES = ["High", "Medium", "Low"];

export const CreateTaskScreen = ({ onBack, onTaskCreated }) => {
  const { user, isManager, demoProfiles } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [category, setCategory] = useState("Frontend UI");
  const [deadline, setDeadline] = useState("2026-08-30");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await authAPI.getEmployees();
      if (res && res.employees) {
        const empOnly = res.employees.filter((e) => e.role === "employee");
        setEmployees(empOnly.length > 0 ? empOnly : demoProfiles.filter((p) => p.role === "employee"));
        if (empOnly.length > 0) setSelectedEmployeeId(empOnly[0].id);
      }
    } catch (err) {
      const defaultEmps = demoProfiles.filter((p) => p.role === "employee");
      setEmployees(defaultEmps);
      if (defaultEmps.length > 0) setSelectedEmployeeId(defaultEmps[0].id);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMsg("Please enter a task title.");
      return;
    }
    if (!selectedEmployeeId) {
      setErrorMsg("Please select an employee to assign this task to.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await tasksAPI.createTask({
        title: title.trim(),
        description: description.trim(),
        assignedToId: selectedEmployeeId,
        priority,
        category,
        deadline,
      });

      if (res.success) {
        onTaskCreated();
      } else {
        setErrorMsg(res.message || "Failed to create task.");
      }
    } catch (err) {
      console.log("Create task error:", err.message);
      onTaskCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign New Task</Text>
        <View style={{ width: 60 }} />
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      {/* 1. Employee Assignment Selection */}
      <GlassCard style={styles.sectionCard} variant="primary">
        <Text style={styles.sectionTitle}>1. Assign To Employee</Text>
        <Text style={styles.sectionSub}>Select the team member responsible for delivery:</Text>

        <View style={styles.employeeList}>
          {employees.map((emp) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <TouchableOpacity
                key={emp.id}
                onPress={() => setSelectedEmployeeId(emp.id)}
                style={[
                  styles.empCard,
                  isSelected && styles.empCardSelected,
                ]}
              >
                <Image source={{ uri: emp.avatar }} style={styles.empAvatar} />
                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empDept}>{emp.department}</Text>
                </View>
                <View style={[styles.selectRadio, isSelected && styles.selectRadioActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* 2. Task Details Form */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. Task Specification</Text>

        <Text style={styles.inputLabel}>Task Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Build Login Screen with Glassmorphism"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Detailed Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Provide clear technical requirements, API endpoints, or UI guidelines..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.inputLabel}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p;
            let activeColor = COLORS.primary;
            if (p === "High") activeColor = COLORS.priorityHigh;
            if (p === "Medium") activeColor = COLORS.priorityMedium;
            if (p === "Low") activeColor = COLORS.priorityLow;

            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityBtn,
                  isSelected && {
                    borderColor: activeColor,
                    backgroundColor: p === "High" ? "rgba(244, 63, 94, 0.2)" : "rgba(6, 182, 212, 0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityBtnText,
                    isSelected && { color: activeColor, fontWeight: "800" },
                  ]}
                >
                  {p === "High" ? "🔥 High" : p === "Medium" ? "⚡ Medium" : "🌱 Low"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Target Deadline (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-08-30"
          placeholderTextColor={COLORS.textMuted}
          value={deadline}
          onChangeText={setDeadline}
        />

        <Text style={styles.inputLabel}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Frontend UI, Backend API, Cloud DevOps"
          placeholderTextColor={COLORS.textMuted}
          value={category}
          onChangeText={setCategory}
        />
      </GlassCard>

      {/* Submit Button */}
      <GlassButton
        title="✨ Assign & Delegate Task"
        onPress={handleCreate}
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
  headerTitle: {
    fontSize: 16,
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
    padding: 18,
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
  employeeList: {
    gap: 10,
  },
  empCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  empCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },
  empAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  empDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  selectRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  selectRadioActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  submitBtn: {
    marginTop: 10,
  },
});
