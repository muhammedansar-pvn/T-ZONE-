import axios from "axios";

// ✅ Base URL export (if needed elsewhere)
export const BASE_URL = "http://localhost:5000";

// ✅ Axios instance
const API = axios.create({
  baseURL: BASE_URL,
});

// ✅ Optional: attach auth user if exists
API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("authUser");

  if (storedUser) {
    const user = JSON.parse(storedUser);

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  return config;
});

export default API;