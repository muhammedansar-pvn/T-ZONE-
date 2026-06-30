/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import API from "../config/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }
      try {
        setLoading(true);
        const res = await API.get("/wishlist");
        if (res.data?.success) {
          setWishlist(res.data.wishlist);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      
      if (!wishlist.find((item) => item._id === product._id)) {
        setWishlist((prev) => [...prev, product]);
      }

      await API.post("/wishlist", { productId: product._id });
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      
      const res = await API.get("/wishlist");
      if (res.data?.success) setWishlist(res.data.wishlist);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      
      setWishlist((prev) => prev.filter((item) => item._id !== id));
      await API.delete(`/wishlist/${id}`);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      const res = await API.get("/wishlist");
      if (res.data?.success) setWishlist(res.data.wishlist);
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
