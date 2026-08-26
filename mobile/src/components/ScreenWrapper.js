import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

export const ScreenWrapper = ({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Atmospheric Ambient Lighting Mesh */}
      <LinearGradient
        colors={["#080C14", "#0C1322", "#070B12"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle Psychological Light Spheres (Indigo & Mint Glow) */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.responsiveShell, isDesktop && styles.desktopContainer]}>
          {scrollable ? (
            <ScrollView
              style={[styles.scroll, style]}
              contentContainerStyle={[styles.content, contentContainerStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                onRefresh ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={COLORS.primary}
                    colors={[COLORS.primary, COLORS.cyan]}
                  />
                ) : undefined
              }
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.nonScrollContent, style]}>{children}</View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    alignItems: "center",
  },
  responsiveShell: {
    flex: 1,
    width: "100%",
  },
  desktopContainer: {
    maxWidth: 880,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(10, 15, 26, 0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  nonScrollContent: {
    flex: 1,
    padding: 20,
  },
  orbTopRight: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
  },
  orbBottomLeft: {
    position: "absolute",
    bottom: -120,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
  },
});
