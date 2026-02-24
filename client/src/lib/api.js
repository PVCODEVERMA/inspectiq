import axios from "axios";

// Auto detect environment (Dev / Production)
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // important if using cookies
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized - Logging out");

      localStorage.removeItem("token");

      // Redirect to login page
      window.location.href = "/login";
    }


    return Promise.reject(error);
  }
);

export default api;
export const API_BASE_URL = BASE_URL;