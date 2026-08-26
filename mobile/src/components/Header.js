import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from "react-native";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/endpoints";
import { GlassCard } from "./GlassCard";
import { COLORS } from "../theme/colors";

const PRESENCE_OPTIONS = [
  { id: "online", label: "Working Online", icon: "🟢", color: "#10B981" },
  { id: "focus", label: "Deep Focus", icon: "🚀", color: "#6366F1" },
  { id: "break", label: "On Short Break", icon: "☕", color: "#F59E0B" },
  { id: "leave", label: "Out of Office", icon: "🏖️", color: "#94A3B8" },
];

export const Header = ({ onProfilePress }) => {
  const { user, isManager } = useAuth();
  const [currentPresence, setCurrentPresence] = useState(user?.presence || "online");
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);

  if (!user) return null;

  const currentOption = PRESENCE_OPTIONS.find((p) => p.id === currentPresence) || PRESENCE_OPTIONS[0];

  const handleSelectPresence = async (pId) => {
    setCurrentPresence(pId);
    setPresenceModalOpen(false);
    try {
      await authAPI.updatePresence(pId);
    } catch (e) {
      console.log("Presence update error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{user.name.split(" ")[0]}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isManager
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(99, 102, 241, 0.2)",
                borderColor: isManager
                  ? "rgba(139, 92, 246, 0.4)"
                  : "rgba(99, 102, 241, 0.4)",
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isManager ? "#C4B5FD" : "#A5B4FC" },
              ]}
            >
              {isManager ? "👑 LEAD" : "💻 ENG"}
            </Text>
          </View>
        </View>

        {/* Interactive Presence Pill */}
        <TouchableOpacity
          onPress={() => setPresenceModalOpen(true)}
          style={styles.presencePill}
        >
          <Text style={styles.presenceIcon}>{currentOption.icon}</Text>
          <Text style={[styles.presenceLabel, { color: currentOption.color }]}>
            {currentOption.label} ▾
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onProfilePress}
        activeOpacity={0.8}
        style={styles.avatarWrapper}
      >
        <Image
          source={{
            uri:
              user.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          }}
          style={[
            styles.avatar,
            { borderColor: isManager ? COLORS.violet : COLORS.primary },
          ]}
        />
        <View
          style={[
            styles.statusRing,
            { backgroundColor: currentOption.color },
          ]}
        />
      </TouchableOpacity>

      {/* Presence Selector Modal */}
      <Modal
        visible={presenceModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPresenceModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPresenceModalOpen(false)}
        >
          <GlassCard style={styles.modalCard} variant="primary">
            <Text style={styles.modalTitle}>Set Your Live Work Presence</Text>
            <Text style={styles.modalSub}>
              Let your team and manager know your current focus and availability:
            </Text>

            <View style={styles.optionsList}>
              {PRESENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleSelectPresence(opt.id)}
                  style={[
                    styles.optionItem,
                    currentPresence === opt.id && styles.optionItemActive,
                  ]}
                >
                  <Text style={styles.optIcon}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optLabel, { color: opt.color }]}>
                      {opt.label}
                    </Text>
                  </View>
                  {currentPresence === opt.id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  leftSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 2,
  },
  roleText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  presencePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignSelf: "flex-start",
    marginTop: 4,
    gap: 4,
  },
  presenceIcon: {
    fontSize: 10,
  },
  presenceLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  statusRing: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#080C14",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 17,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 10,
  },
  optionItemActive: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: COLORS.primary,
  },
  optIcon: {
    fontSize: 16,
  },
  optLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  checkMark: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "900",
  },
});
