import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, systemAPI } from "../api/endpoints";
import { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const DEFAULT_DEMO_PROFILES = [
  {
    id: "user_manager_1",
    name: "Sarah Jenkins",
    email: "manager@company.com",
    role: "manager",
    department: "Engineering Lead",
    employeeCode: "MGR-001",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "user_emp_1",
    name: "Rahul Sharma",
    email: "rahul@company.com",
    role: "employee",
    department: "Mobile Frontend Engineer",
    employeeCode: "EMP-104",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "user_emp_2",
    name: "Alex Chen",
    email: "alex@company.com",
    role: "employee",
    department: "Backend & Cloud Engineer",
    employeeCode: "EMP-108",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "user_emp_3",
    name: "Priya Patel",
    email: "priya@company.com",
    role: "employee",
    department: "UI/UX & Design Systems",
    employeeCode: "EMP-112",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [demoProfiles, setDemoProfiles] = useState(DEFAULT_DEMO_PROFILES);
  const [loading, setLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [dbMode, setDbMode] = useState("Checking...");

  // Check health and fetch demo profiles
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      const health = await systemAPI.getHealth();
      setServerOnline(true);
      setDbMode(health.database?.mode || "online");

      const profilesRes = await authAPI.getDemoProfiles();
      if (profilesRes && profilesRes.profiles) {
        setDemoProfiles(profilesRes.profiles);
      }
    } catch (err) {
      console.log("Server health check:", err.message);
      setServerOnline(false);
      setDbMode("Standalone Demo Mode");
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || "Login failed." };
    } catch (error) {
      // Fallback for standalone offline testing
      const matched = demoProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        setToken("mock_jwt_token_" + matched.id);
        return { success: true, user: matched };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password.",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || "Registration failed." };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration error.",
      };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (userId) => {
    setLoading(true);
    try {
      const res = await authAPI.demoLogin(userId);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (error) {
      console.log("API demo login error, using local fallback profile:", error.message);
    }

    // Local instant fallback
    const matched = demoProfiles.find((p) => p.id === userId) || demoProfiles[0];
    setUser(matched);
    setToken("mock_jwt_token_" + matched.id);
    setLoading(false);
    return { success: true, user: matched };
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const isManager = user?.role === "manager";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        demoProfiles,
        loading,
        serverOnline,
        dbMode,
        isManager,
        login,
        register,
        demoLogin,
        logout,
        checkServerConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
