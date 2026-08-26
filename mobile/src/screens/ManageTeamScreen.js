import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Modal, ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { PasswordInput } from "../components/PasswordInput";
import { ProgressBar } from "../components/ProgressBar";
import { AnimatedCard } from "../components/AnimatedCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

export const ManageTeamScreen = ({ onBack, onAssignTaskToEmployee, onSwitchUser }) => {
  const { user, demoLogin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Frontend Engineering");
  const [lastCreated, setLastCreated] = useState(null);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");

  // Delete confirmation modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingEmp, setDeletingEmp] = useState(null);

  const showFeedback = (msg, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 4000); }
    else { setFeedbackMsg(msg); setTimeout(() => setFeedbackMsg(""), 4000); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await authAPI.getEmployees();
      if (res && res.employees) setEmployees(res.employees.filter((e) => e.role === "employee"));
    } catch (err) { console.log("Fetch employees error:", err.message); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAutoGenerateCreds = () => {
    const cleanName = (name || "employee").toLowerCase().replace(/[^a-z0-9]/g, "");
    const n = Math.floor(1000 + Math.random() * 9000);
    setEmail(`${cleanName || "emp"}.${n}@company.com`);
    setPassword(`Pass#${Math.floor(100 + Math.random() * 900)}!`);
  };

  const handleCreateEmployee = async () => {
    if (!name.trim()) { showFeedback("Employee name is required.", true); return; }
    try {
      setSubmitting(true);
      const res = await authAPI.createEmployee({ name: name.trim(), email, password, department });
      if (res.success) {
        setLastCreated(res.credentials);
        showFeedback(`✅ ${name.trim()} onboarded! Credentials ready below.`);
        setName(""); setEmail(""); setPassword("");
        fetchEmployees();
      } else { showFeedback(res.message || "Failed to create employee.", true); }
    } catch (err) { showFeedback("Server error creating employee.", true); }
    finally { setSubmitting(false); }
  };

  const handleBatchGenerate = async () => {
    try {
      setSubmitting(true);
      const res = await authAPI.batchGenerateEmployees(3);
      if (res.success) { showFeedback("✅ Spawned 3 random employees!"); fetchEmployees(); }
    } catch (err) { showFeedback("Batch generation error.", true); }
    finally { setSubmitting(false); }
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditDept(emp.department);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmp) return;
    try {
      setSubmitting(true);
      const res = await authAPI.updateEmployee(editingEmp.id, { name: editName, department: editDept });
      if (res.success) {
        showFeedback(`✅ ${editName}'s profile updated.`);
        setEditModalVisible(false);
        fetchEmployees();
      } else { showFeedback(res.message || "Update failed.", true); }
    } catch (err) { showFeedback("Update error.", true); }
    finally { setSubmitting(false); }
  };

  const openDeleteModal = (emp) => { setDeletingEmp(emp); setDeleteModalVisible(true); };

  const handleConfirmDelete = async () => {
    if (!deletingEmp) return;
    try {
      setSubmitting(true);
      const res = await authAPI.deleteEmployee(deletingEmp.id);
      if (res.success) {
        showFeedback(`🗑️ ${deletingEmp.name} removed. ${res.tasksUnassigned} task(s) unassigned.`);
        setDeleteModalVisible(false);
        setDeletingEmp(null);
        fetchEmployees();
      } else { showFeedback(res.message || "Delete failed.", true); }
    } catch (err) { showFeedback("Delete error.", true); }
    finally { setSubmitting(false); }
  };

  const isAdityaProtected = (emp) => emp.name === "Aditya Tiwari";

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Team Management Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      {feedbackMsg ? <View style={styles.successBanner}><Text style={styles.successText}>{feedbackMsg}</Text></View> : null}
      {errorMsg ? <View style={styles.errorBanner}><Text style={styles.errorText}>⚠️ {errorMsg}</Text></View> : null}

      {/* Credentials Callout */}
      {lastCreated && (
        <AnimatedCard delay={50}>
          <GlassCard style={styles.credBox} variant="success" glow={true}>
            <Text style={styles.credTitle}>🎉 New Employee Login Credentials</Text>
            <View style={styles.credRow}><Text style={styles.credLabel}>Email:</Text><Text style={styles.credValue}>{lastCreated.email}</Text></View>
            <View style={styles.credRow}><Text style={styles.credLabel}>Password:</Text><Text style={styles.credValue}>{lastCreated.password}</Text></View>
            <View style={styles.credRow}><Text style={styles.credLabel}>ID Code:</Text><Text style={styles.credValue}>{lastCreated.employeeCode}</Text></View>
            <Text style={styles.credSub}>Share these credentials — employee can log in immediately and start completing tasks!</Text>
          </GlassCard>
        </AnimatedCard>
      )}

      {/* Create Employee Form */}
      <AnimatedCard delay={100}>
        <GlassCard style={styles.formCard} variant="primary">
          <Text style={styles.sectionHeading}>➕ Onboard New Employee</Text>
          <Text style={styles.sectionSub}>Fill in a name and optionally set email/password, or auto-generate both:</Text>

          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Liam Vance" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

          <Text style={styles.inputLabel}>Email (leave blank to auto-generate)</Text>
          <TextInput style={styles.input} placeholder="auto-generated if empty" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" />

          <Text style={styles.inputLabel}>Password (leave blank to auto-generate)</Text>
          <PasswordInput value={password} onChangeText={setPassword} placeholder="auto-generated if empty" />

          <TouchableOpacity onPress={handleAutoGenerateCreds} style={styles.autoFillBtn}>
            <Text style={styles.autoFillText}>🎲 Auto-Fill Random Email & Password</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Department / Specialization</Text>
          <TextInput style={styles.input} placeholder="e.g. Mobile Frontend, Backend Cloud" placeholderTextColor={COLORS.textMuted} value={department} onChangeText={setDepartment} />

          <GlassButton title="✨ Create & Activate Employee" onPress={handleCreateEmployee} loading={submitting} variant="primary" size="lg" style={styles.createBtn} />
        </GlassCard>
      </AnimatedCard>

      {/* Batch Spawn */}
      <AnimatedCard delay={150}>
        <GlassCard style={styles.batchCard} variant="amber">
          <View style={styles.batchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.batchTitle}>⚡ Instant Test Accounts</Text>
              <Text style={styles.batchDesc}>Spawn 3 random demo employees with auto-generated credentials.</Text>
            </View>
            <GlassButton title="🎲 Spawn 3" onPress={handleBatchGenerate} loading={submitting} variant="glass" size="sm" />
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Team Roster */}
      <AnimatedCard delay={200}>
        <View style={styles.rosterSection}>
          <Text style={styles.sectionHeading}>📋 Active Employee Roster ({employees.length})</Text>

          <View style={styles.rosterList}>
            {employees.map((emp) => {
              const isAditya = isAdityaProtected(emp);
              return (
                <GlassCard key={emp.id} style={[styles.empCard, isAditya && styles.empCardHighlight]}>
                  {isAditya && (
                    <View style={styles.adityaBadge}>
                      <Text style={styles.adityaBadgeText}>⭐ Priority Employee</Text>
                    </View>
                  )}

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

                  {/* Manager Action Buttons */}
                  <View style={styles.empActionsGrid}>
                    <TouchableOpacity onPress={() => onAssignTaskToEmployee(emp.id)} style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>📋 Assign Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onSwitchUser(emp.id)} style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>👤 Login As</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openEditModal(emp)} style={[styles.actionBtn, styles.editBtn]}>
                      <Text style={[styles.actionBtnText, { color: "#A5B4FC" }]}>✏️ Edit Profile</Text>
                    </TouchableOpacity>

                    {!isAditya ? (
                      <TouchableOpacity onPress={() => openDeleteModal(emp)} style={[styles.actionBtn, styles.deleteBtn]}>
                        <Text style={[styles.actionBtnText, { color: "#FB7185" }]}>🗑️ Remove</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.actionBtn, styles.protectedBtn]}>
                        <Text style={[styles.actionBtnText, { color: COLORS.textMuted, fontSize: 10 }]}>🔒 Protected</Text>
                      </View>
                    )}
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </View>
      </AnimatedCard>

      {/* Edit Employee Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalBox} variant="primary">
            <Text style={styles.modalTitle}>✏️ Edit Employee Profile</Text>
            <Text style={styles.modalNote}>You can update name and department. Role and account ownership cannot be changed.</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />

            <Text style={styles.inputLabel}>Department</Text>
            <TextInput style={styles.input} value={editDept} onChangeText={setEditDept} />

            <View style={styles.modalBtnRow}>
              <GlassButton title="Cancel" onPress={() => setEditModalVisible(false)} variant="glass" size="sm" />
              <GlassButton title="Save Changes" onPress={handleSaveEdit} loading={submitting} variant="primary" size="sm" />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalBox} variant="default">
            <Text style={styles.deleteModalTitle}>🗑️ Remove Employee Account</Text>
            <Text style={styles.deleteModalDesc}>
              You are about to permanently remove <Text style={{ color: "#FB7185", fontWeight: "900" }}>{deletingEmp?.name}</Text> from the organization.
            </Text>
            <View style={styles.deleteInfoBox}>
              <Text style={styles.deleteInfoText}>• Their account will be deleted permanently</Text>
              <Text style={styles.deleteInfoText}>• Their assigned tasks will be marked as Unassigned (not deleted)</Text>
              <Text style={styles.deleteInfoText}>• Their chat messages will remain visible in the channel</Text>
              <Text style={styles.deleteInfoText}>• This action CANNOT be undone</Text>
            </View>
            <View style={styles.modalBtnRow}>
              <GlassButton title="Cancel" onPress={() => setDeleteModalVisible(false)} variant="glass" size="sm" />
              <GlassButton title="🗑️ Confirm Remove" onPress={handleConfirmDelete} loading={submitting} variant="danger" size="sm" />
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
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: COLORS.glassBorder },
  backBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  headerTitle: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary },
  successBanner: { backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 1, borderColor: "rgba(16,185,129,0.35)", padding: 12, borderRadius: 12, marginBottom: 16 },
  successText: { color: "#6EE7B7", fontSize: 13, fontWeight: "700", textAlign: "center" },
  errorBanner: { backgroundColor: "rgba(244,63,94,0.15)", borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: "#FB7185", fontSize: 13, fontWeight: "700" },
  credBox: { padding: 16, marginBottom: 16 },
  credTitle: { fontSize: 14, fontWeight: "800", color: COLORS.completed, marginBottom: 10 },
  credRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  credLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "700" },
  credValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: "800" },
  credSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 8, fontStyle: "italic" },
  formCard: { padding: 20, marginBottom: 16 },
  sectionHeading: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 17 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "rgba(10,15,26,0.75)", borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  autoFillBtn: { marginTop: 8, alignSelf: "flex-end", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "rgba(99,102,241,0.15)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" },
  autoFillText: { fontSize: 11, fontWeight: "700", color: "#A5B4FC" },
  createBtn: { marginTop: 18 },
  batchCard: { padding: 14, marginBottom: 20 },
  batchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  batchTitle: { fontSize: 13, fontWeight: "800", color: COLORS.pending, marginBottom: 2 },
  batchDesc: { fontSize: 11, color: COLORS.textSecondary },
  rosterSection: { marginBottom: 20 },
  rosterList: { gap: 12, marginTop: 12 },
  empCard: { padding: 14 },
  empCardHighlight: { borderColor: "rgba(99,102,241,0.5)", backgroundColor: "rgba(99,102,241,0.06)" },
  adityaBadge: { backgroundColor: "rgba(99,102,241,0.2)", paddingVertical: 3, paddingHorizontal: 10, borderRadius: 8, alignSelf: "flex-start", marginBottom: 8 },
  adityaBadgeText: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
  empTopRow: { flexDirection: "row", alignItems: "center" },
  empAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
  empInfo: { flex: 1 },
  empName: { fontSize: 14, fontWeight: "800", color: COLORS.textPrimary },
  empEmail: { fontSize: 12, color: COLORS.primary, marginTop: 1 },
  empDept: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  passChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: "flex-start", marginTop: 8, gap: 6 },
  passChipLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "700" },
  passChipValue: { fontSize: 11, fontWeight: "800", color: COLORS.textPrimary },
  empActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  actionBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: COLORS.glassBorder },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary },
  editBtn: { backgroundColor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)" },
  deleteBtn: { backgroundColor: "rgba(244,63,94,0.12)", borderColor: "rgba(244,63,94,0.3)" },
  protectedBtn: { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { width: "100%", maxWidth: 440, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 6 },
  modalNote: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 17 },
  modalBtnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  deleteModalTitle: { fontSize: 16, fontWeight: "800", color: "#FB7185", marginBottom: 8 },
  deleteModalDesc: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 19, marginBottom: 14 },
  deleteInfoBox: { backgroundColor: "rgba(244,63,94,0.08)", borderWidth: 1, borderColor: "rgba(244,63,94,0.25)", borderRadius: 10, padding: 12, gap: 5, marginBottom: 4 },
  deleteInfoText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
