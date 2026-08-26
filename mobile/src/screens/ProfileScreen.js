import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { systemAPI } from "../api/endpoints";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { COLORS } from "../theme/colors";

export const ProfileScreen = ({ onBack, onNavigateToCreator, onNavigateToLogin }) => {
  const {
    user,
    demoProfiles,
    demoLogin,
    logout,
    serverOnline,
    dbMode,
    isManager,
  } = useAuth();

  const [reseedLoading, setReseedLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleReseed = async () => {
    try {
      setReseedLoading(true);
      await systemAPI.reseed();
      setFeedbackMsg("✅ Database successfully re-seeded with demo data!");
      setTimeout(() => setFeedbackMsg(""), 4000);
    } catch (err) {
      setFeedbackMsg("⚠️ Operating in standalone mode");
      setTimeout(() => setFeedbackMsg(""), 4000);
    } finally {
      setReseedLoading(false);
    }
  };

  const handleSwitchUser = async (userId) => {
    await demoLogin(userId);
    setFeedbackMsg(`Switched active profile to ${demoProfiles.find((p) => p.id === userId)?.name}`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleOpenWhatsApp = () => {
    const url = "https://wa.me/916390857720?text=Hi%20Aditya,%20I%20reviewed%20your%20TaskMaster%20Pro%20application!";
    Linking.openURL(url).catch((err) => console.log("WhatsApp open error:", err));
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & System Diagnostics</Text>
        <View style={{ width: 60 }} />
      </View>

      {feedbackMsg ? (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedbackMsg}</Text>
        </View>
      ) : null}

      {/* Creator Showcase Banner Card */}
      <TouchableOpacity activeOpacity={0.85} onPress={onNavigateToCreator}>
        <GlassCard style={styles.creatorBannerCard} variant="primary" glow={true}>
          <View style={styles.creatorBannerRow}>
            <Image
              source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari" }}
              style={styles.creatorBannerAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.creatorBannerTag}>APPLICATION ARCHITECT</Text>
              <Text style={styles.creatorBannerName}>Created by Aditya Tiwari</Text>
              <Text style={styles.creatorBannerSub}>Full-Stack Mobile Engineer • View Portfolio ➔</Text>
            </View>
            <TouchableOpacity onPress={handleOpenWhatsApp} style={styles.bannerWhatsAppBtn}>
              <Text style={styles.bannerWhatsAppText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Profile Overview Card */}
      <GlassCard style={styles.profileCard} variant={isManager ? "accent" : "primary"} glow={true}>
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }}
            style={[
              styles.avatarLarge,
              { borderColor: isManager ? COLORS.violet : COLORS.primary },
            ]}
          />
          <View
            style={[
              styles.roleTagBig,
              { backgroundColor: isManager ? "rgba(139, 92, 246, 0.25)" : "rgba(99, 102, 241, 0.25)" },
            ]}
          >
            <Text
              style={[
                styles.roleTextBig,
                { color: isManager ? "#C4B5FD" : "#A5B4FC" },
              ]}
            >
              {user.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.userNameLarge}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userDept}>{user.department}</Text>

        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>EMPLOYEE ID:</Text>
          <Text style={styles.codeValue}>{user.employeeCode || "EMP-100"}</Text>
        </View>
      </GlassCard>

      {/* System & Cloud Connection Card */}
      <GlassCard style={styles.systemCard}>
        <Text style={styles.sectionTitle}>⚙️ Production Infrastructure Status</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Express REST Backend:</Text>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: serverOnline ? COLORS.completed : COLORS.pending },
              ]}
            />
            <Text style={styles.statusValue}>
              {serverOnline ? "Connected (Port 5000)" : "Standalone Mode"}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Database Storage Engine:</Text>
          <Text style={[styles.statusValue, { color: COLORS.primary }]}>
            {dbMode === "cloud_firestore" ? "🔥 Google Cloud Firestore" : "⚡ High-Fidelity In-Memory Store"}
          </Text>
        </View>

        <View style={styles.systemActionRow}>
          <GlassButton
            title="🔄 Re-Seed Demo Dataset"
            onPress={handleReseed}
            loading={reseedLoading}
            variant="glass"
            size="sm"
            style={styles.reseedBtn}
          />
        </View>
      </GlassCard>

      {/* Quick Profile Switcher */}
      <GlassCard style={styles.switchCard}>
        <Text style={styles.sectionTitle}>👥 1-Tap Switch Active User</Text>
        <Text style={styles.sectionSub}>
          Toggle between Manager and Employee profiles to test role permissions:
        </Text>

        <View style={styles.demoList}>
          {demoProfiles.map((p) => {
            const isCurrent = p.id === user.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleSwitchUser(p.id)}
                style={[
                  styles.demoItem,
                  isCurrent && styles.demoItemActive,
                ]}
              >
                <Image source={{ uri: p.avatar }} style={styles.demoSmallAvatar} />
                <View style={styles.demoSmallInfo}>
                  <Text style={[styles.demoSmallName, isCurrent && { color: COLORS.primary }]}>
                    {p.name} {isCurrent && "✓ (Active)"}
                  </Text>
                  <Text style={styles.demoSmallRole}>
                    {p.role.toUpperCase()} • {p.department}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* Logout Button */}
      <GlassButton
        title="🚪 Sign Out"
        onPress={handleLogout}
        variant="danger"
        size="lg"
        style={styles.logoutBtn}
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
  feedbackBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackText: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  creatorBannerCard: {
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.4)",
  },
  creatorBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  creatorBannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  creatorBannerTag: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  creatorBannerName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  creatorBannerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bannerWhatsAppBtn: {
    backgroundColor: "rgba(37, 211, 102, 0.18)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 211, 102, 0.4)",
  },
  bannerWhatsAppText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#25D366",
  },
  profileCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    marginBottom: 8,
  },
  roleTagBig: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  roleTextBig: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  userNameLarge: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userDept: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 8,
  },
  codeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  codeValue: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  systemCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  systemActionRow: {
    marginTop: 14,
  },
  reseedBtn: {
    width: "100%",
  },
  switchCard: {
    padding: 16,
    marginBottom: 20,
  },
  demoList: {
    gap: 8,
  },
  demoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  demoItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  demoSmallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  demoSmallInfo: {
    flex: 1,
  },
  demoSmallName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  demoSmallRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    marginBottom: 20,
  },
});
