import React, { createContext, useContext, useState, useEffect } from "react";
import appStorage from "../utils/storage";
import { authAPI, systemAPI } from "../api/endpoints";

const AuthContext = createContext(null);

const FALLBACK_PROFILES = [
  {
    id: "user_manager_1",
    name: "Sarah Jenkins",
    email: "manager@company.com",
    role: "manager",
    department: "Engineering Lead & Product Manager",
    employeeCode: "MGR-001",
    presence: "online",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: "user_emp_aditya",
    name: "Aditya Tiwari",
    email: "aditya@company.com",
    role: "employee",
    department: "Lead Full Stack & Mobile App Engineer",
    employeeCode: "EMP-101",
    presence: "focus",
    avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=AdityaTiwari",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [demoProfiles, setDemoProfiles] = useState(FALLBACK_PROFILES);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [dbMode, setDbMode] = useState("in_memory");

  const checkHealthAndProfiles = async () => {
    try {
      const healthRes = await systemAPI.getHealth();
      if (healthRes && healthRes.status === "online") {
        setServerOnline(true);
        setDbMode(healthRes.database?.mode || "in_memory");
      }
      const profilesRes = await authAPI.getDemoProfiles();
      if (profilesRes && profilesRes.profiles && profilesRes.profiles.length > 0) {
        setDemoProfiles(profilesRes.profiles);
      }
    } catch (e) {
      console.log("Using standalone demo mode.");
      setServerOnline(false);
      setDemoProfiles(FALLBACK_PROFILES);
    }
  };

  const loadStoredSession = async () => {
    try {
      setLoading(true);
      const storedToken = await appStorage.getItem("taskmaster_token");
      const storedUser = await appStorage.getItem("taskmaster_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log("Error loading session:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealthAndProfiles();
    loadStoredSession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authAPI.login(email, password);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await appStorage.setItem("taskmaster_token", res.token);
        await appStorage.setItem("taskmaster_user", JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || "Invalid credentials." };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Server connection failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (userId) => {
    try {
      setLoading(true);
      const res = await authAPI.demoLogin(userId);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await appStorage.setItem("taskmaster_token", res.token);
        await appStorage.setItem("taskmaster_user", JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      const matched = FALLBACK_PROFILES.find((p) => p.id === userId) || FALLBACK_PROFILES[0];
      setUser(matched);
      setToken("fallback_jwt_demo_token");
      await appStorage.setItem("taskmaster_user", JSON.stringify(matched));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.register(userData);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await appStorage.setItem("taskmaster_token", res.token);
        await appStorage.setItem("taskmaster_user", JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || "Registration failed." };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await appStorage.removeItem("taskmaster_token");
      await appStorage.removeItem("taskmaster_user");
      setToken(null);
      setUser(null);
    } catch (e) {
      console.log("Logout error:", e);
    }
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
        demoLogin,
        register,
        logout,
        refreshProfiles: checkHealthAndProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
