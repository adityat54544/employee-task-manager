import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

export const LoginScreen = () => {
  const { login, register, demoLogin, demoProfiles, loading, serverOnline, dbMode } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("manager@company.com");
  const [password, setPassword] = useState("password123");

  // Registration states
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("Engineering");

  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.message || "Failed to log in.");
    }
  };

  const handleRegister = async () => {
    setErrorMessage("");
    if (!name || !regEmail || !regPassword) {
      setErrorMessage("Please fill all required fields.");
      return;
    }
    const result = await register({
      name,
      email: regEmail,
      password: regPassword,
      role,
      department,
    });
    if (!result.success) {
      setErrorMessage(result.message || "Registration failed.");
    }
  };

  const handleQuickDemo = async (userId) => {
    setErrorMessage("");
    await demoLogin(userId);
  };

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Branding Section */}
      <View style={styles.brandHero}>
        <View style={styles.logoBadge}>
          <LinearGradient
            colors={["#06B6D4", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </LinearGradient>
        </View>
        <Text style={styles.appTitle}>TaskMaster <Text style={styles.titleGlow}>Pro</Text></Text>
        <Text style={styles.appTagline}>
          Role-Based Employee Task & Work Log Management
        </Text>

        {/* Server & DB Status Pill */}
        <View style={styles.statusPillContainer}>
          <View style={[styles.statusDot, { backgroundColor: serverOnline ? COLORS.completed : "#F59E0B" }]} />
          <Text style={styles.statusPillText}>
            Backend: {serverOnline ? "Online" : "Standalone"} • DB: {dbMode}
          </Text>
        </View>
      </View>

      {/* 1-Tap Quick Demo Login Section (Crucial for Reviewers/Recruiters) */}
      <GlassCard style={styles.demoBox} variant="primary" glow={true}>
        <View style={styles.demoHeader}>
          <Text style={styles.demoTitle}>🚀 1-Tap Quick Demo Access</Text>
          <Text style={styles.demoSubtitle}>
            Click any profile below to instantly log in with pre-seeded tasks & permissions
          </Text>
        </View>

        <View style={styles.demoProfilesList}>
          {demoProfiles.map((p) => {
            const isMgr = p.role === "manager";
            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.8}
                onPress={() => handleQuickDemo(p.id)}
                style={[
                  styles.demoCard,
                  isMgr ? styles.demoCardManager : styles.demoCardEmployee,
                ]}
              >
                <Image source={{ uri: p.avatar }} style={styles.demoAvatar} />
                <View style={styles.demoInfo}>
                  <View style={styles.demoNameRow}>
                    <Text style={styles.demoName}>{p.name}</Text>
                    <View
                      style={[
                        styles.demoRoleTag,
                        { backgroundColor: isMgr ? "rgba(139, 92, 246, 0.25)" : "rgba(6, 182, 212, 0.25)" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.demoRoleText,
                          { color: isMgr ? "#C4B5FD" : "#67E8F9" },
                        ]}
                      >
                        {p.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.demoDept}>{p.department}</Text>
                </View>
                <Text style={styles.demoArrow}>➔</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* Traditional Login / Registration Card */}
      <GlassCard style={styles.formCard}>
        {/* Toggle Tabs */}
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={[styles.tabBtn, !isRegisterMode && styles.tabBtnActive]}
            onPress={() => {
              setIsRegisterMode(false);
              setErrorMessage("");
            }}
          >
            <Text style={[styles.tabBtnText, !isRegisterMode && styles.tabBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, isRegisterMode && styles.tabBtnActive]}
            onPress={() => {
              setIsRegisterMode(true);
              setErrorMessage("");
            }}
          >
            <Text style={[styles.tabBtnText, isRegisterMode && styles.tabBtnTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {!isRegisterMode ? (
          /* Sign In Form */
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. manager@company.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <GlassButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.actionBtn}
            />
          </View>
        ) : (
          /* Registration Form */
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Morgan"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. alex@company.com"
              placeholderTextColor={COLORS.textMuted}
              value={regEmail}
              onChangeText={setRegEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.textMuted}
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Role Selection</Text>
            <View style={styles.rolePickerRow}>
              <TouchableOpacity
                style={[styles.roleSelectBtn, role === "employee" && styles.roleSelectBtnActive]}
                onPress={() => setRole("employee")}
              >
                <Text style={[styles.roleSelectText, role === "employee" && styles.roleSelectTextActive]}>
                  👤 Employee
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleSelectBtn, role === "manager" && styles.roleSelectBtnActive]}
                onPress={() => setRole("manager")}
              >
                <Text style={[styles.roleSelectText, role === "manager" && styles.roleSelectTextActive]}>
                  👑 Manager
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Department / Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Frontend Engineering"
              placeholderTextColor={COLORS.textMuted}
              value={department}
              onChangeText={setDepartment}
            />

            <GlassButton
              title="Register & Enter"
              onPress={handleRegister}
              loading={loading}
              variant="secondary"
              style={styles.actionBtn}
            />
          </View>
        )}
      </GlassCard>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 28,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  titleGlow: {
    color: COLORS.primary,
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  statusPillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  demoBox: {
    marginBottom: 24,
    padding: 16,
  },
  demoHeader: {
    marginBottom: 14,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  demoSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  demoProfilesList: {
    gap: 10,
  },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoCardManager: {
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderColor: "rgba(139, 92, 246, 0.35)",
  },
  demoCardEmployee: {
    backgroundColor: "rgba(6, 182, 212, 0.10)",
    borderColor: "rgba(6, 182, 212, 0.30)",
  },
  demoAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  demoInfo: {
    flex: 1,
  },
  demoNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  demoName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  demoRoleTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  demoRoleText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  demoDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  demoArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  formCard: {
    padding: 20,
  },
  tabHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  errorBanner: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#FB7185",
    fontSize: 12,
    fontWeight: "600",
  },
  formContent: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: -4,
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
  rolePickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleSelectBtn: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleSelectBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },
  roleSelectText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  roleSelectTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  actionBtn: {
    marginTop: 8,
  },
});
