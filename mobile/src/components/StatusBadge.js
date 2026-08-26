import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export const StatusBadge = ({ status = "Pending", size = "md" }) => {
  const norm = status.toLowerCase();

  let bg = COLORS.pendingBg;
  let border = COLORS.pendingBorder;
  let text = COLORS.pending;
  let label = "Pending";

  if (norm === "in progress" || norm === "in_progress") {
    bg = COLORS.inProgressBg;
    border = COLORS.inProgressBorder;
    text = COLORS.inProgress;
    label = "In Progress";
  } else if (norm === "completed") {
    bg = COLORS.completedBg;
    border = COLORS.completedBorder;
    text = COLORS.completed;
    label = "Completed";
  }

  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSm && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.text, { color: text }, isSm && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 11,
    fontWeight: "600",
  },
});
