import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const blockedToastShown = useRef(false);

  // 🔹 Load user from localStorage
  useEffect(() => {

    const storedUser = localStorage.getItem("authUser");

    if (storedUser) {

      try {

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

      } catch {

        localStorage.removeItem("authUser");

      }

    }

    setAuthLoading(false);

  }, []);




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




  // 🔹 Check user status (Polling)
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
        setUser(latestUser);
        localStorage.setItem("authUser", JSON.stringify(latestUser));

      } catch (error) {

        console.log("User status check failed", error);

      }

    };

    const interval = setInterval(checkUserStatus, 3000);

    return () => clearInterval(interval);

  }, [user?.id]);




  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>

  );

};