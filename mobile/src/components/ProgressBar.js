import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../theme/colors";

export const ProgressBar = ({
  progress = 0,
  height = 7,
  showLabel = true,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));
  const widthAnim = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clampedProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  let gradient = GRADIENTS.primary;
  if (clampedProgress >= 100) {
    gradient = GRADIENTS.emerald;
  } else if (clampedProgress < 30) {
    gradient = GRADIENTS.amber;
  }

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          <Text style={styles.percentageText}>{clampedProgress}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fillWrapper,
            {
              width: widthInterpolated,
              height,
              borderRadius: height / 2,
            },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientFill, { height, borderRadius: height / 2 }]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  percentageText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  track: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  fillWrapper: {
    overflow: "hidden",
  },
  gradientFill: {
    width: "100%",
  },
});
