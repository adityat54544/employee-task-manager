import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../theme/colors";

export const GlassButton = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon: IconComponent,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 45,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 45,
      bounciness: 4,
    }).start();
  };

  let gradientColors = GRADIENTS.primary;
  let borderColor = "rgba(255, 255, 255, 0.15)";
  let textColor = COLORS.white;

  if (variant === "glass") {
    gradientColors = ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.02)"];
    borderColor = COLORS.glassBorder;
    textColor = COLORS.textPrimary;
  } else if (variant === "secondary") {
    gradientColors = GRADIENTS.violetIndigo;
  } else if (variant === "success") {
    gradientColors = GRADIENTS.emerald;
  } else if (variant === "danger") {
    gradientColors = GRADIENTS.rose;
  } else if (variant === "outline") {
    gradientColors = ["transparent", "transparent"];
    borderColor = COLORS.primary;
    textColor = COLORS.primary;
  }

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.touchable, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={disabled ? ["#1E293B", "#0F172A"] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonBase,
            { borderColor },
            isSmall && styles.btnSm,
            isLarge && styles.btnLg,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <View style={styles.contentRow}>
              {IconComponent && <View style={styles.iconContainer}>{IconComponent}</View>}
              <Text
                style={[
                  styles.btnText,
                  { color: disabled ? COLORS.textMuted : textColor },
                  isSmall && styles.textSm,
                  isLarge && styles.textLg,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonBase: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnLg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 12,
    fontWeight: "600",
  },
  textLg: {
    fontSize: 16,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.5,
  },
});
