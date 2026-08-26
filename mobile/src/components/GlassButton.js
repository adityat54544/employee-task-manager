import React, { useRef } from "react";
import {
  TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../theme/colors";

const VARIANTS = {
  primary: { gradient: GRADIENTS.primary, textColor: "#FFFFFF" },
  secondary: { gradient: GRADIENTS.violet, textColor: "#FFFFFF" },
  success: { gradient: GRADIENTS.emerald, textColor: "#FFFFFF" },
  danger: { gradient: ["#F43F5E", "#E11D48"], textColor: "#FFFFFF" },
  amber: { gradient: GRADIENTS.amber, textColor: "#1C1410" },
  glass: { gradient: null, textColor: COLORS.textPrimary },
};

const SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 12, borderRadius: 10 },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14, borderRadius: 12 },
  lg: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: 14 },
};

export const GlassButton = ({
  title, onPress, loading = false, disabled = false,
  variant = "primary", size = "md", style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const content = (
    <View style={[styles.inner, { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal, borderRadius: s.borderRadius }]}>
      {loading
        ? <ActivityIndicator size="small" color={v.textColor} />
        : <Text style={[styles.label, { fontSize: s.fontSize, color: v.textColor }]}>{title}</Text>
      }
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {v.gradient ? (
          <LinearGradient
            colors={v.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientWrapper, { borderRadius: s.borderRadius }]}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.glassWrapper, { borderRadius: s.borderRadius }]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: { overflow: "hidden" },
  glassWrapper: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inner: { alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "800", letterSpacing: 0.3 },
});
