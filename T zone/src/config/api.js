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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle unauthenticated sessions (401)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error response status is 401 (Unauthorized) and the request has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const path = window.location.pathname;
      if (path === "/login" || path === "/signup") {
        return Promise.reject(error);
      }

      // If a refresh request is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new access token from the backend refresh route
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { token } = res.data;

        // Store new access token
        localStorage.setItem("token", token);
        
        const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        if (authUser.id) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({ ...authUser, token })
          );
        }

        // Apply new token to default headers and retry the original request
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        isRefreshing = false;

        return API(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired -> force logout
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        localStorage.removeItem("wishlist");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;