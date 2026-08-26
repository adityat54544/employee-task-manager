import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS, GRADIENTS } from "../theme/colors";

export const LoginScreen = () => {
  const { login, register, demoLogin, demoProfiles, loading, serverOnline, dbMode } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("manager@company.com");
  const [password, setPassword] = useState("password123");

  // Registration state
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
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </LinearGradient>
        </View>
        <Text style={styles.appTitle}>TaskMaster <Text style={styles.titleGlow}>Pro</Text></Text>
        <Text style={styles.appTagline}>
          Role-Based Task Management & Daily Progress Tracking
        </Text>

        {/* Server & DB Status Pill */}
        <View style={styles.statusPillContainer}>
          <View style={[styles.statusDot, { backgroundColor: serverOnline ? COLORS.completed : COLORS.pending }]} />
          <Text style={styles.statusPillText}>
            Backend: {serverOnline ? "Online" : "Standalone"} • Storage: {dbMode}
          </Text>
        </View>
      </View>

      {/* 1-Tap Quick Demo Login Section */}
      <GlassCard style={styles.demoBox} variant="primary" glow={true}>
        <View style={styles.demoHeader}>
          <Text style={styles.demoTitle}>🚀 1-Tap Quick Demo Access</Text>
          <Text style={styles.demoSubtitle}>
            Select any profile below to instantly evaluate role workflows and permissions:
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
                        { backgroundColor: isMgr ? "rgba(139, 92, 246, 0.2)" : "rgba(99, 102, 241, 0.2)" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.demoRoleText,
                          { color: isMgr ? "#C4B5FD" : "#A5B4FC" },
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
              title="Sign In with Credentials"
              onPress={handleLogin}
              loading={loading}
              style={styles.actionBtn}
            />
          </View>
        ) : (
          /* Registration Form */
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rahul@company.com"
              placeholderTextColor={COLORS.textMuted}
              value={regEmail}
              onChangeText={setRegEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.textMuted}
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Select Your Role</Text>
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
              title="Create Account & Enter"
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
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 26,
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
    backgroundColor: "rgba(255, 255, 255, 0.04)",
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
    marginBottom: 20,
    padding: 18,
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
    lineHeight: 17,
  },
  demoProfilesList: {
    gap: 10,
  },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoCardManager: {
    backgroundColor: "rgba(139, 92, 246, 0.10)",
    borderColor: "rgba(139, 92, 246, 0.35)",
  },
  demoCardEmployee: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.28)",
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  demoRoleTag: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  demoRoleText: {
    fontSize: 9,
    fontWeight: "900",
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
    backgroundColor: "rgba(255, 255, 255, 0.04)",
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
    backgroundColor: "rgba(255, 255, 255, 0.10)",
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
    fontWeight: "700",
  },
  formContent: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: -4,
  },
  input: {
    backgroundColor: "rgba(10, 15, 26, 0.7)",
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
    backgroundColor: "rgba(10, 15, 26, 0.7)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleSelectBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
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
