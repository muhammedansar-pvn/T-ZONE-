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


API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const path = window.location.pathname;
      if (path === "/login" || path === "/signup") {
        return Promise.reject(error);
      }

      
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
        
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { token } = res.data;

        
        localStorage.setItem("token", token);
        
        const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        if (authUser.id) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({ ...authUser, token })
          );
        }

        
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        isRefreshing = false;

        return API(originalRequest);
      } catch (refreshError) {
        
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