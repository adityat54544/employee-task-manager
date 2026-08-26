import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export const PriorityBadge = ({ priority = "Medium", size = "md" }) => {
  const norm = (priority || "").toLowerCase();

  let bg = COLORS.priorityMediumBg;
  let border = COLORS.priorityMediumBorder;
  let text = COLORS.priorityMedium;
  let label = "Medium";

  if (norm === "high") {
    bg = COLORS.priorityHighBg;
    border = COLORS.priorityHighBorder;
    text = COLORS.priorityHigh;
    label = "High Priority";
  } else if (norm === "low") {
    bg = COLORS.priorityLowBg;
    border = COLORS.priorityLowBorder;
    text = COLORS.priorityLow;
    label = "Low Priority";
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
      <Text style={[styles.text, { color: text }, isSm && styles.textSm]}>
        {norm === "high" ? "🔥 " : norm === "low" ? "🌱 " : "⚡ "}
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 10,
    fontWeight: "600",
  },
});
