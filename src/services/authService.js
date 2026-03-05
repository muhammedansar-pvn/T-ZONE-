import axios from "axios";
import { BASE_URL } from "../config/api";

/* ================================
   LOGIN
================================ */
export const loginUser = async (email, password) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/users?email=${email}`
    );

    if (res.data.length === 0) {
      throw new Error("User not found");
    }

    const user = res.data[0];

    if (user.password !== password) {
      throw new Error("Invalid password");
    }

    if (user.isBlocked) {
      throw new Error("Your account has been blocked");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/* ================================
   REGISTER
================================ */
export const registerUser = async (userData) => {
  try {
    // Check duplicate email
    const check = await axios.get(
      `${BASE_URL}/users?email=${userData.email}`
    );

    if (check.data.length > 0) {
      throw new Error("Email already registered");
    }

    const res = await axios.post(`${BASE_URL}/users`, {
      ...userData,
      isBlocked: false,
      role: "user",
      createdAt: new Date().toISOString(),
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};