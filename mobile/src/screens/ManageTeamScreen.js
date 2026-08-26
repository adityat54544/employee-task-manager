import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { authAPI, tasksAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { PasswordInput } from "../components/PasswordInput";
import { AnimatedCard } from "../components/AnimatedCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

export const ManageTeamScreen = ({
  onBack,
  onAssignTaskToEmployee,
  onSwitchUser,
}) => {
  const { user, isManager, demoLogin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Employee Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Frontend Engineering");

  // Last Created Employee Credentials (to display clearly)
  const [lastCreated, setLastCreated] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getEmployees();
      if (res && res.employees) {
        setEmployees(res.employees.filter((e) => e.role === "employee"));
      }
    } catch (err) {
      console.log("Fetch employees error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAutoGenerateCreds = () => {
    const cleanName = (name || "employee").toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setEmail(`${cleanName || "emp"}.${randomNum}@company.com`);
    setPassword(`Pass#${Math.floor(100 + Math.random() * 900)}!`);
  };

  const handleCreateEmployee = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter the employee's full name.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const res = await authAPI.createEmployee({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        department: department.trim(),
      });

      if (res.success) {
        setLastCreated(res.credentials);
        setFeedbackMsg(`✅ Account created for ${name.trim()}! Credentials ready below.`);
        setName("");
        setEmail("");
        setPassword("");
        fetchEmployees();
      } else {
        setErrorMsg(res.message || "Failed to create employee.");
      }
    } catch (err) {
      console.log("Create employee error:", err.message);
      setErrorMsg("Server error creating employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchGenerate = async () => {
    try {
      setSubmitting(true);
      setErrorMsg("");
      const res = await authAPI.batchGenerateEmployees(3);
      if (res.success) {
        setFeedbackMsg("✅ Generated 3 random employee profiles successfully!");
        fetchEmployees();
      }
    } catch (err) {
      console.log("Batch generate error:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Management Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      {feedbackMsg ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{feedbackMsg}</Text>
        </View>
      ) : null}

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      {/* Created Credentials Showcase Callout */}
      {lastCreated && (
        <AnimatedCard delay={50}>
          <GlassCard style={styles.credentialsBox} variant="success" glow={true}>
            <Text style={styles.credentialsTitle}>🎉 Newly Generated Employee Credentials:</Text>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Email:</Text>
              <Text style={styles.credValue}>{lastCreated.email}</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Password:</Text>
              <Text style={styles.credValue}>{lastCreated.password}</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Employee Code:</Text>
              <Text style={styles.credValue}>{lastCreated.employeeCode}</Text>
            </View>
            <Text style={styles.credSub}>
              The employee can immediately sign in with this email & password to manage tasks and chat!
            </Text>
          </GlassCard>
        </AnimatedCard>
      )}

      {/* Create New Employee Card */}
      <AnimatedCard delay={100}>
        <GlassCard style={styles.formCard} variant="primary">
          <Text style={styles.sectionHeading}>👤 Onboard New Team Member</Text>
          <Text style={styles.sectionSub}>
            Create custom employee accounts or generate random login credentials in 1 click:
          </Text>

          <Text style={styles.inputLabel}>Employee Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Liam Vance"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.generatorRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Email (Custom or Auto-Generated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Leave blank to auto-generate"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Password (Custom or Auto-Generated)</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to auto-generate"
          />

          <View style={styles.quickGenBtnRow}>
            <TouchableOpacity
              onPress={handleAutoGenerateCreds}
              style={styles.quickGenBtn}
            >
              <Text style={styles.quickGenBtnText}>🎲 Auto-Fill Random Email & Password</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Department / Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mobile Frontend, Backend Cloud, UI/UX"
            placeholderTextColor={COLORS.textMuted}
            value={department}
            onChangeText={setDepartment}
          />

          <GlassButton
            title="✨ Create & Activate Employee"
            onPress={handleCreateEmployee}
            loading={submitting}
            variant="primary"
            size="lg"
            style={styles.createBtn}
          />
        </GlassCard>
      </AnimatedCard>

      {/* Batch Random Generation Section */}
      <AnimatedCard delay={150}>
        <GlassCard style={styles.batchCard} variant="amber">
          <View style={styles.batchRow}>
            <View style={styles.batchInfo}>
              <Text style={styles.batchTitle}>⚡ Need Instant Test Accounts?</Text>
              <Text style={styles.batchDesc}>
                Instantly spawn 3 random demo employees with avatars and login credentials.
              </Text>
            </View>
            <GlassButton
              title="🎲 Spawn 3"
              onPress={handleBatchGenerate}
              loading={submitting}
              variant="glass"
              size="sm"
            />
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Team Roster List */}
      <AnimatedCard delay={200}>
        <View style={styles.rosterSection}>
          <Text style={styles.sectionHeading}>
            👥 Active Organization Employees ({employees.length})
          </Text>

          <View style={styles.rosterList}>
            {employees.map((emp) => (
              <GlassCard key={emp.id} style={styles.empCard}>
                <View style={styles.empTopRow}>
                  <Image source={{ uri: emp.avatar }} style={styles.empAvatar} />
                  <View style={styles.empInfo}>
                    <Text style={styles.empName}>{emp.name}</Text>
                    <Text style={styles.empEmail}>{emp.email}</Text>
                    <Text style={styles.empDept}>{emp.department} • {emp.employeeCode || "EMP"}</Text>
                  </View>
                </View>

                {emp.rawPassword ? (
                  <View style={styles.passChip}>
                    <Text style={styles.passChipLabel}>Password:</Text>
                    <Text style={styles.passChipValue}>{emp.rawPassword}</Text>
                  </View>
                ) : null}

                <View style={styles.empActionsRow}>
                  <TouchableOpacity
                    onPress={() => onAssignTaskToEmployee(emp.id)}
                    style={styles.assignTaskBtn}
                  >
                    <Text style={styles.assignTaskText}>+ Assign Task</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onSwitchUser(emp.id)}
                    style={styles.switchLoginBtn}
                  >
                    <Text style={styles.switchLoginText}>👤 Login as {emp.name.split(" ")[0]}</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  successBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  errorBanner: {
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
  credentialsBox: {
    padding: 16,
    marginBottom: 16,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.completed,
    marginBottom: 10,
  },
  credRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  credLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  credValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  credSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "rgba(10, 15, 26, 0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  generatorRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  quickGenBtnRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  quickGenBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  quickGenBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A5B4FC",
  },
  createBtn: {
    marginTop: 18,
  },
  batchCard: {
    padding: 14,
    marginBottom: 20,
  },
  batchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchInfo: {
    flex: 1,
    paddingRight: 10,
  },
  batchTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.pending,
    marginBottom: 2,
  },
  batchDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  rosterSection: {
    marginBottom: 20,
  },
  rosterList: {
    gap: 12,
    marginTop: 12,
  },
  empCard: {
    padding: 14,
  },
  empTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  empAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  empEmail: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 1,
  },
  empDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  passChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 6,
  },
  passChipLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  passChipValue: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  empActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  assignTaskBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.35)",
  },
  assignTaskText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  switchLoginBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  switchLoginText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
});
