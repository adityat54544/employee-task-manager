import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Production Render Cloud API URL or Environment Variable
export const PRODUCTION_API_URL = "https://employee-task-manager-api.onrender.com/api";

// Determine default URL based on environment
let initialBaseUrl = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

// Local development fallback for Web / Emulators
if (process.env.NODE_ENV === "development" && !process.env.EXPO_PUBLIC_API_URL) {
  if (Platform.OS === "web") {
    initialBaseUrl = "http://localhost:5000/api";
  } else if (Platform.OS === "android") {
    initialBaseUrl = "http://10.0.2.2:5000/api";
  }
}

export let API_BASE_URL = initialBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const updateCustomApiUrl = async (newUrl) => {
  if (!newUrl) return;
  const formatted = newUrl.endsWith("/api") ? newUrl : `${newUrl.replace(/\/$/, "")}/api`;
  API_BASE_URL = formatted;
  apiClient.defaults.baseURL = formatted;
  await AsyncStorage.setItem("taskmaster_custom_api_url", formatted);
};

export const loadSavedApiUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem("taskmaster_custom_api_url");
    if (saved) {
      API_BASE_URL = saved;
      apiClient.defaults.baseURL = saved;
    }
  } catch (e) {
    console.log("Error loading saved API URL:", e);
  }
};

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => currentToken;

export default apiClient;
