import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

export const GlassCard = ({
  children,
  style,
  onPress,
  variant = "default",
  glow = false,
  gradientBorder = false,
}) => {
  let borderColor = COLORS.glassBorder;
  let bgColors = [COLORS.cardBg, COLORS.cardBgLighter];

  if (variant === "primary") {
    borderColor = COLORS.glassBorderActive;
    bgColors = ["rgba(6, 182, 212, 0.12)", "rgba(15, 23, 42, 0.85)"];
  } else if (variant === "accent") {
    borderColor = "rgba(139, 92, 246, 0.5)";
    bgColors = ["rgba(139, 92, 246, 0.12)", "rgba(15, 23, 42, 0.85)"];
  } else if (variant === "success") {
    borderColor = "rgba(16, 185, 129, 0.5)";
    bgColors = ["rgba(16, 185, 129, 0.12)", "rgba(15, 23, 42, 0.85)"];
  } else if (variant === "highlight") {
    borderColor = "rgba(255, 255, 255, 0.25)";
    bgColors = ["rgba(255, 255, 255, 0.08)", "rgba(30, 41, 59, 0.9)"];
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
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  glowShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
});
