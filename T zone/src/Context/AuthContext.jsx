/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔹 Lazy state initialization to avoid synchronous state update in useEffect
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("authUser");
      }
    }
    return null;
  });

  const authLoading = false;
  const blockedToastShown = useRef(false);

  // 🔹 Login
  const login = (userData) => {
    if (userData?.isBlocked) {
      toast.error("Your account has been temporarily blocked");
      return;
    }
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  // 🔹 Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("wishlist");
    window.location.replace("/login");
  };

  // 🔹 Update Profile (Added feature to fix profile editor crash)
  const updateProfile = async (updatedData) => {
    if (!user?.id) return;
    try {
      const res = await axios.patch(`${BASE_URL}/users/${user.id}`, updatedData);
      const latestUser = res.data;
      const updatedUser = {
        ...latestUser,
        token: user.token,
      };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      return latestUser;
    } catch (error) {
      console.error("Profile update failed", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  // 🔹 Check user status (Polling every 30 seconds)
  useEffect(() => {
    if (!user?.id) return;

    const checkUserStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users/${user.id}`);
        const latestUser = res.data;

        // User deleted
        if (!latestUser) {
          logout();
          return;
        }

        // User blocked
        if (latestUser.isBlocked) {
          if (!blockedToastShown.current) {
            blockedToastShown.current = true;
            toast.error("Your account has been blocked by admin");
          }
          logout();
          return;
        }

        // Update latest user
        const updatedUser = {
          ...latestUser,
          token: user.token,
        };
        setUser(updatedUser);
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      } catch (error) {
        console.log("User status check failed", error);
      }
    };

    const interval = setInterval(checkUserStatus, 30000); // 30 seconds polling
    return () => clearInterval(interval);
  }, [user?.id]);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        isAdmin,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};