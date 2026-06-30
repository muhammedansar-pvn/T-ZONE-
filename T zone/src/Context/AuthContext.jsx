/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef, useContext } from "react";
import API from "../config/api";
import toast from "react-hot-toast";
import { logoutUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
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

  
  const login = (userData) => {
    if (userData?.isBlocked) {
      toast.error("Your account has been temporarily blocked");
      return;
    }

    setUser(userData);

    localStorage.setItem(
      "authUser",
      JSON.stringify(userData)
    );

    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  };

  
  const logout = async () => {
    setUser(null);
    await logoutUser();
    window.location.replace("/login");
  };

  
  const updateProfile = async (updatedData) => {
    if (!user?.id) return;
    try {
      const res = await API.patch(`/users/${user.id}`, updatedData);
      const latestUser = res.data;
      const updatedUser = {
        ...latestUser,
        id: latestUser._id || latestUser.id || user.id,
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

  
  useEffect(() => {
    if (!user?.id) return;

    const checkUserStatus = async () => {
      try {
        const res = await API.get(`/users/${user.id}`);
        const latestUser = res.data;

        
        if (!latestUser) {
          logout();
          return;
        }

        
        if (latestUser.isBlocked) {
          if (!blockedToastShown.current) {
            blockedToastShown.current = true;
            toast.error("Your account has been blocked by admin");
          }
          logout();
          return;
        }

        
        const updatedUser = {
          ...latestUser,
          id: latestUser._id || latestUser.id || user.id,
          token: user.token,
        };
        setUser(updatedUser);
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      } catch (error) {
        console.log("User status check failed", error);
        if (error.response && (error.response.status === 404 || error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
      }
    };

    const interval = setInterval(checkUserStatus, 30000); 
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