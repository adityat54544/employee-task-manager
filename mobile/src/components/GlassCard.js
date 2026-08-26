import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

export const GlassCard = ({
  children,
  style,
  onPress,
  variant = "default",
  glow = false,
}) => {
  let borderColor = COLORS.glassBorder;
  let bgColors = ["rgba(19, 28, 49, 0.70)", "rgba(12, 18, 32, 0.85)"];

  if (variant === "primary") {
    borderColor = "rgba(99, 102, 241, 0.4)";
    bgColors = ["rgba(99, 102, 241, 0.12)", "rgba(12, 18, 32, 0.90)"];
  } else if (variant === "accent" || variant === "violet") {
    borderColor = "rgba(139, 92, 246, 0.4)";
    bgColors = ["rgba(139, 92, 246, 0.12)", "rgba(12, 18, 32, 0.90)"];
  } else if (variant === "success" || variant === "emerald") {
    borderColor = "rgba(16, 185, 129, 0.4)";
    bgColors = ["rgba(16, 185, 129, 0.10)", "rgba(12, 18, 32, 0.90)"];
  } else if (variant === "amber" || variant === "warning") {
    borderColor = "rgba(245, 158, 11, 0.4)";
    bgColors = ["rgba(245, 158, 11, 0.10)", "rgba(12, 18, 32, 0.90)"];
  } else if (variant === "danger" || variant === "rose") {
    borderColor = "rgba(244, 63, 94, 0.4)";
    bgColors = ["rgba(244, 63, 94, 0.10)", "rgba(12, 18, 32, 0.90)"];
  }

  const cardContent = (
    <LinearGradient
      colors={bgColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { borderColor },
        glow && styles.glowShadow,
        style,
      ]}
    >
      {/* Top Glass Refraction Micro-Line */}
      <View style={styles.topRefraction} />
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  topRefraction: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  glowShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
});
