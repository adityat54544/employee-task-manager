import { Platform } from "react-native";

// In-memory key-value cache fallback
const memoryStore = {};

// Web: use localStorage (no native modules needed)
// Native (Android/iOS): lazy require so Metro never resolves it on web build
let AsyncStorage = null;

if (Platform.OS !== "web") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch (e) {
    AsyncStorage = null;
  }
}

export const appStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStore[key] ?? null;
      }
      if (AsyncStorage) return await AsyncStorage.getItem(key);
      return memoryStore[key] ?? null;
    } catch (e) {
      return memoryStore[key] ?? null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        memoryStore[key] = value;
        return;
      }
      if (AsyncStorage) await AsyncStorage.setItem(key, value);
      else memoryStore[key] = value;
    } catch (e) {
      memoryStore[key] = value;
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        delete memoryStore[key];
        return;
      }
      if (AsyncStorage) await AsyncStorage.removeItem(key);
      else delete memoryStore[key];
    } catch (e) {
      delete memoryStore[key];
    }
  },
};

export default appStorage;
