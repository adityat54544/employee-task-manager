import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const memoryStore = {};

export const appStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return memoryStore[key] || null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      memoryStore[key] = value;
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      delete memoryStore[key];
    }
  },
};

export default appStorage;
