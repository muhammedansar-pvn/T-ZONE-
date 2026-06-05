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

    localStorage.setItem("token", token);

    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login failed"
    );
  }
};

/* ================================
   REGISTER
================================ */

export const registerUser = async (userData) => {
  try {
    const res = await API.post("/auth/register", {
      username: userData.name,
      email: userData.email,
      password: userData.password,
    });

    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Registration failed"
    );
  }
};