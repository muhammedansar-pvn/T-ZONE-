import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

// Fallback: If localStorage token exists, attach it to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated sessions (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        localStorage.removeItem("wishlist");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;