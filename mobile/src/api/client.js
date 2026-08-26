import axios from "axios";
import { Platform } from "react-native";

// Dynamic default API Base URL depending on environment (Web vs Android Emulator vs iOS Simulator vs Localhost)
let defaultBaseUrl = "http://localhost:5000/api";
if (Platform.OS === "android") {
  defaultBaseUrl = "http://10.0.2.2:5000/api";
}

export const API_BASE_URL = defaultBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
