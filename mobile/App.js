import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { TaskDetailScreen } from "./src/screens/TaskDetailScreen";
import { AddUpdateScreen } from "./src/screens/AddUpdateScreen";
import { CreateTaskScreen } from "./src/screens/CreateTaskScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { COLORS, GRADIENTS } from "./src/theme/colors";

const MainNavigator = () => {
  const { user, isManager } = useAuth();

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("DASHBOARD"); // DASHBOARD, TASKS, CHAT, TASK_DETAIL, ADD_UPDATE, CREATE_TASK, PROFILE
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");
  const [selectedTaskProgress, setSelectedTaskProgress] = useState(0);

  if (!user) {
    return <LoginScreen />;
  }

  const navigateToTaskDetail = (taskId) => {
    setSelectedTaskId(taskId);
    setCurrentScreen("TASK_DETAIL");
  };

  const navigateToAddUpdate = (taskId, taskTitle, progress) => {
    setSelectedTaskId(taskId);
    setSelectedTaskTitle(taskTitle);
    setSelectedTaskProgress(progress);
    setCurrentScreen("ADD_UPDATE");
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {currentScreen === "DASHBOARD" && (
          <DashboardScreen
            onNavigateToTasks={() => setCurrentScreen("TASKS")}
            onNavigateToTaskDetail={navigateToTaskDetail}
            onNavigateToCreateTask={() => setCurrentScreen("CREATE_TASK")}
            onNavigateToProfile={() => setCurrentScreen("PROFILE")}
          />
        )}

        {currentScreen === "TASKS" && (
          <TasksScreen
            onNavigateToTaskDetail={navigateToTaskDetail}
            onNavigateToCreateTask={() => setCurrentScreen("CREATE_TASK")}
            onNavigateToProfile={() => setCurrentScreen("PROFILE")}
          />
        )}

        {currentScreen === "CHAT" && (
          <ChatScreen
            onNavigateToProfile={() => setCurrentScreen("PROFILE")}
          />
        )}

        {currentScreen === "TASK_DETAIL" && (
          <TaskDetailScreen
            taskId={selectedTaskId}
            onBack={() => setCurrentScreen("TASKS")}
            onNavigateToAddUpdate={navigateToAddUpdate}
          />
        )}

        {currentScreen === "ADD_UPDATE" && (
          <AddUpdateScreen
            taskId={selectedTaskId}
            taskTitle={selectedTaskTitle}
            initialProgress={selectedTaskProgress}
            onBack={() => setCurrentScreen("TASK_DETAIL")}
            onUpdateSubmitted={() => setCurrentScreen("TASK_DETAIL")}
          />
        )}

        {currentScreen === "CREATE_TASK" && (
          <CreateTaskScreen
            onBack={() => setCurrentScreen("DASHBOARD")}
            onTaskCreated={() => setCurrentScreen("TASKS")}
          />
        )}

        {currentScreen === "PROFILE" && (
          <ProfileScreen
            onBack={() => setCurrentScreen("DASHBOARD")}
            onNavigateToLogin={() => {}}
          />
        )}
      </View>

      {/* Glassmorphic Bottom Navigation Bar */}
      {["DASHBOARD", "TASKS", "CHAT", "PROFILE"].includes(currentScreen) && (
        <View style={styles.bottomNavWrapper}>
          <LinearGradient
            colors={["rgba(19, 28, 49, 0.94)", "rgba(10, 15, 26, 0.98)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bottomNav}
          >
            {/* Tab 1: Dashboard */}
            <TouchableOpacity
              onPress={() => setCurrentScreen("DASHBOARD")}
              style={[
                styles.navTab,
                currentScreen === "DASHBOARD" && styles.navTabActive,
              ]}
            >
              <Text style={styles.tabIcon}>📊</Text>
              <Text
                style={[
                  styles.tabLabel,
                  currentScreen === "DASHBOARD" && styles.tabLabelActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Tasks List */}
            <TouchableOpacity
              onPress={() => setCurrentScreen("TASKS")}
              style={[
                styles.navTab,
                currentScreen === "TASKS" && styles.navTabActive,
              ]}
            >
              <Text style={styles.tabIcon}>📋</Text>
              <Text
                style={[
                  styles.tabLabel,
                  currentScreen === "TASKS" && styles.tabLabelActive,
                ]}
              >
                Tasks
              </Text>
            </TouchableOpacity>

            {/* Middle Action: Create Task (if Manager) */}
            {isManager && (
              <TouchableOpacity
                onPress={() => setCurrentScreen("CREATE_TASK")}
                style={styles.centerFab}
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.centerFabGradient}
                >
                  <Text style={styles.centerFabIcon}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Tab 3: Live Chat */}
            <TouchableOpacity
              onPress={() => setCurrentScreen("CHAT")}
              style={[
                styles.navTab,
                currentScreen === "CHAT" && styles.navTabActive,
              ]}
            >
              <Text style={styles.tabIcon}>💬</Text>
              <Text
                style={[
                  styles.tabLabel,
                  currentScreen === "CHAT" && styles.tabLabelActive,
                ]}
              >
                Live Chat
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Profile */}
            <TouchableOpacity
              onPress={() => setCurrentScreen("PROFILE")}
              style={[
                styles.navTab,
                currentScreen === "PROFILE" && styles.navTabActive,
              ]}
            >
              <Text style={styles.tabIcon}>👤</Text>
              <Text
                style={[
                  styles.tabLabel,
                  currentScreen === "PROFILE" && styles.tabLabelActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  bottomNav: {
    width: "100%",
    maxWidth: 640,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  navTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  navTabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  centerFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: -20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  centerFabGradient: {
    flex: 1,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  centerFabIcon: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: -2,
  },
});
