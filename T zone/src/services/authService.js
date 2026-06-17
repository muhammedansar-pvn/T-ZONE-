import API from "../config/api";

/* ================================
   LOGIN
================================ */
export const loginUser = async (email, password) => {
  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    const { token } = res.data;
    if (token) {
      localStorage.setItem("token", token);
    }

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

/* ================================
   REGISTER
================================ */
export const registerUser = async (userData) => {
  try {
    const res = await API.post("/auth/register", {
      name: userData.name,
      username: userData.name,
      email: userData.email,
      password: userData.password,
    });

    const { token } = res.data;
    if (token) {
      localStorage.setItem("token", token);
    }

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

/* ================================
   LOGOUT
================================ */
export const logoutUser = async () => {
  try {
    await API.post("/auth/logout");
  } catch (error) {
    console.error("Server logout error:", error.message);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    localStorage.removeItem("wishlist");
  }
};