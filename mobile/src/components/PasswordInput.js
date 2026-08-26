import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS } from "../theme/colors";

export const PasswordInput = ({
  value,
  onChangeText,
  placeholder = "••••••••",
  style,
}) => {
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const toggleSecure = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    setIsSecure(!isSecure);
  };

  return (
    <View
      style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        style,
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
      />
      <TouchableOpacity
        onPress={toggleSecure}
        activeOpacity={0.75}
        style={styles.eyeBtn}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.eyeIcon}>{isSecure ? "👁️" : "🙈"}</Text>
        </Animated.View>
        <Text style={styles.eyeLabel}>{isSecure ? "Show" : "Hide"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 26, 0.75)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(10, 15, 26, 0.95)",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    gap: 4,
  },
  eyeIcon: {
    fontSize: 14,
  },
  eyeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
});
