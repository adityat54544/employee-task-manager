import apiClient from "./client";

export const authAPI = {
  login: async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  },
  getDemoProfiles: async () => {
    const res = await apiClient.get("/auth/demo-profiles");
    return res.data;
  },
  demoLogin: async (userId) => {
    const res = await apiClient.post("/auth/demo-login", { userId });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
  getEmployees: async () => {
    const res = await apiClient.get("/auth/employees");
    return res.data;
  },
};

export const tasksAPI = {
  getTasks: async (params = {}) => {
    const res = await apiClient.get("/tasks", { params });
    return res.data;
  },
  getTaskById: async (id) => {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await apiClient.post("/tasks", taskData);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/tasks/${id}/status`, { status });
    return res.data;
  },
  addComment: async (id, text) => {
    const res = await apiClient.post(`/tasks/${id}/comments`, { text });
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await apiClient.delete(`/tasks/${id}`);
    return res.data;
  },
};

export const updatesAPI = {
  addWorkUpdate: async (taskId, updateData) => {
    const res = await apiClient.post(`/tasks/${taskId}/updates`, updateData);
    return res.data;
  },
  getTaskUpdates: async (taskId) => {
    const res = await apiClient.get(`/tasks/${taskId}/updates`);
    return res.data;
  },
};

export const analyticsAPI = {
  getDashboardStats: async () => {
    const res = await apiClient.get("/analytics/dashboard");
    return res.data;
  },
};

export const systemAPI = {
  getHealth: async () => {
    const res = await apiClient.get("/health");
    return res.data;
  },
  reseed: async () => {
    const res = await apiClient.post("/seed");
    return res.data;
  },
};
