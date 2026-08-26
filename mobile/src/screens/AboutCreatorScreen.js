import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { AnimatedCard } from "../components/AnimatedCard";
import { COLORS, GRADIENTS } from "../theme/colors";

export const AboutCreatorScreen = ({ onBack }) => {
  const handleOpenWhatsApp = () => {
    const url = "https://wa.me/916390857720?text=Hi%20Aditya,%20I%20reviewed%20your%20TaskMaster%20Pro%20application%20and%20would%20love%20to%20connect!";
    Linking.openURL(url).catch((err) => console.log("Error opening WhatsApp:", err));
  };

  const handleOpenPhone = () => {
    Linking.openURL("tel:+916390857720").catch((err) => console.log("Error opening phone dialer:", err));
  };

  const handleOpenGitHub = () => {
    Linking.openURL("https://github.com/adityat54544/employee-task-manager").catch((err) => console.log("Error opening GitHub:", err));
  };

  return (
    <ScreenWrapper scrollable={true} contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👨‍💻 Application Architect</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Developer Hero Card */}
      <AnimatedCard delay={100}>
        <GlassCard style={styles.heroCard} variant="primary" glow={true}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.avatarGlowRing}
            >
              <Image
                source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari" }}
                style={styles.creatorAvatar}
              />
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ PRO ARCHITECT</Text>
            </View>
          </View>

          <Text style={styles.creatorName}>Aditya Tiwari</Text>
          <Text style={styles.creatorRole}>Lead Full-Stack & Mobile App Engineer</Text>
          <Text style={styles.creatorBio}>
            Designed, architected, and engineered TaskMaster Pro from the ground up — featuring full-stack Node.js Express REST APIs, role-based JWT authentication, cloud database dual-mode storage, real-time live chat with manager moderation controls, psychological color UI design, and responsive executive dashboards.
          </Text>

          {/* Quick Contact Action Buttons */}
          <View style={styles.contactActionsRow}>
            <TouchableOpacity
              onPress={handleOpenWhatsApp}
              activeOpacity={0.85}
              style={styles.whatsappBtn}
            >
              <LinearGradient
                colors={["#25D366", "#128C7E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.whatsappGradient}
              >
                <Text style={styles.whatsappIcon}>💬</Text>
                <Text style={styles.whatsappLabel}>WhatsApp: +91 6390857720</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryContactRow}>
              <TouchableOpacity onPress={handleOpenPhone} style={styles.contactPill}>
                <Text style={styles.pillIcon}>📞</Text>
                <Text style={styles.pillLabel}>Direct Call</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleOpenGitHub} style={styles.contactPill}>
                <Text style={styles.pillIcon}>🐙</Text>
                <Text style={styles.pillLabel}>GitHub Repo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Tech Stack & Architecture Highlights */}
      <AnimatedCard delay={150}>
        <GlassCard style={styles.sectionCard} variant="default">
          <Text style={styles.sectionHeading}>⚡ Demonstrated Technical Expertise</Text>

          <View style={styles.skillsGrid}>
            <View style={styles.skillBadge}>
              <Text style={styles.skillIcon}>⚛️</Text>
              <View>
                <Text style={styles.skillTitle}>React Native & Expo</Text>
                <Text style={styles.skillSub}>6 polished screens, glassmorphic styling, spring physics</Text>
              </View>
            </View>

            <View style={styles.skillBadge}>
              <Text style={styles.skillIcon}>🚀</Text>
              <View>
                <Text style={styles.skillTitle}>Node.js & Express REST API</Text>
                <Text style={styles.skillSub}>Role-based JWT auth, custom middleware, CRUD endpoints</Text>
              </View>
            </View>

            <View style={styles.skillBadge}>
              <Text style={styles.skillIcon}>🔥</Text>
              <View>
                <Text style={styles.skillTitle}>Cloud Database & Dual Mode</Text>
                <Text style={styles.skillSub}>Firebase Firestore Admin SDK + Zero-config offline memory store</Text>
              </View>
            </View>

            <View style={styles.skillBadge}>
              <Text style={styles.skillIcon}>💬</Text>
              <View>
                <Text style={styles.skillTitle}>Real-Time Live Chat & Moderation</Text>
                <Text style={styles.skillSub}>Manager pins, deletes, edits, emoji reactions, and confidential 1-on-1 DMs</Text>
              </View>
            </View>

            <View style={styles.skillBadge}>
              <Text style={styles.skillIcon}>🎨</Text>
              <View>
                <Text style={styles.skillTitle}>Psychological Ergonomic UI/UX</Text>
                <Text style={styles.skillSub}>Dark canvas, Trust Indigo, Emerald achievement badges, Linear-grade layout</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>

      {/* Hire / Connect CTA */}
      <AnimatedCard delay={200}>
        <GlassCard style={styles.hireCard} variant="success" glow={true}>
          <Text style={styles.hireTitle}>🤝 Available for Full-Time & High-Impact Roles</Text>
          <Text style={styles.hireDesc}>
            Looking for a skilled developer who builds production-ready apps with speed, clean architecture, and modern UX? Reach out to Aditya Tiwari directly!
          </Text>

          <GlassButton
            title="💬 Message Aditya on WhatsApp (+91 6390857720)"
            onPress={handleOpenWhatsApp}
            variant="success"
            size="lg"
            style={styles.hireCtaBtn}
          />
        </GlassCard>
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
  heroCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarGlowRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  creatorAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0F172A",
  },
  verifiedBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: -10,
    borderWidth: 2,
    borderColor: "#080C14",
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  creatorName: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  creatorRole: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 12,
  },
  creatorBio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  contactActionsRow: {
    width: "100%",
    gap: 10,
  },
  whatsappBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  whatsappGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  whatsappIcon: {
    fontSize: 18,
  },
  whatsappLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  secondaryContactRow: {
    flexDirection: "row",
    gap: 10,
  },
  contactPill: {
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
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionCard: {
    padding: 18,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  skillsGrid: {
    gap: 12,
  },
  skillBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 10,
  },
  skillIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  skillTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  skillSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  hireCard: {
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  hireTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.completed,
    textAlign: "center",
    marginBottom: 6,
  },
  hireDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  hireCtaBtn: {
    width: "100%",
  },
});
