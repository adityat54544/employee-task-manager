import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export const UrgencyBadge = ({ deadline }) => {
  if (!deadline) return null;

  const targetDate = new Date(deadline);
  const now = new Date();
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let label = `Due in ${diffDays}d`;
  let color = COLORS.textSecondary;
  let bg = "rgba(255, 255, 255, 0.05)";
  let border = "rgba(255, 255, 255, 0.1)";

  if (diffDays < 0) {
    label = `Overdue ${Math.abs(diffDays)}d`;
    color = COLORS.priorityHigh;
    bg = "rgba(244, 63, 94, 0.15)";
    border = "rgba(244, 63, 94, 0.4)";
  } else if (diffDays === 0) {
    label = "Due Today!";
    color = COLORS.pending;
    bg = "rgba(245, 158, 11, 0.18)";
    border = "rgba(245, 158, 11, 0.4)";
  } else if (diffDays <= 2) {
    label = `Due in ${diffDays}d 🔥`;
    color = "#FB923C";
    bg = "rgba(251, 146, 60, 0.15)";
    border = "rgba(251, 146, 60, 0.35)";
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
