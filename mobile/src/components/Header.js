import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

export const Header = ({ onProfilePress, onSwitchRolePress }) => {
  const { user, isManager, dbMode } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftCol}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandTitle}>TASK<Text style={styles.brandHighlight}>MASTER</Text></Text>
        </View>
        <Text style={styles.welcomeText}>
          Hello, <Text style={styles.userName}>{user.name.split(" ")[0]}</Text> 👋
        </Text>
      </View>

      <View style={styles.rightCol}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onProfilePress}
          style={styles.profileBadge}
        >
          <View
            style={[
              styles.roleTag,
              isManager ? styles.roleManager : styles.roleEmployee,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isManager ? "#A78BFA" : "#22D3EE" },
              ]}
            >
              {user.role?.toUpperCase()}
            </Text>
          </View>
          <Image
            source={{ uri: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }}
            style={[
              styles.avatar,
              { borderColor: isManager ? COLORS.secondary : COLORS.primary },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  leftCol: {
    flex: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.textPrimary,
  },
  brandHighlight: {
    color: COLORS.primary,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  userName: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  roleTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    marginRight: 8,
  },
  roleManager: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  roleEmployee: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.4)",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
  },
});
