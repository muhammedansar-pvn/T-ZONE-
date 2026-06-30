/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import API from "../config/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }
      try {
        setLoading(true);
        const res = await API.get("/cart");
        if (res.data?.success) {
          setCart(res.data.cart);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  
  const addToCart = async (product) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (product.stock <= 0) {
      alert("Out of Stock");
      return;
    }

    try {
      
      setCart((prevCart) => {
        const existing = prevCart.find((item) => item._id === product._id);
        if (existing) {
          return prevCart; 
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });

      await API.post("/cart", { productId: product._id, quantity: 1 });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      
      const res = await API.get("/cart");
      if (res.data?.success) setCart(res.data.cart);
    }
  };

  
  const removeFromCart = async (id) => {
    try {
      
      setCart((prev) => prev.filter((item) => item._id !== id));
      await API.delete(`/cart/${id}`);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      const res = await API.get("/cart");
      if (res.data?.success) setCart(res.data.cart);
    }
  };

  
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    
    const item = cart.find((item) => item._id === id);
    if (item && newQuantity > item.stock) {
      alert(`Only ${item.stock} items available`);
      return;
    }

    try {
      
      setCart((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      await API.put(`/cart/${id}`, { quantity: newQuantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      const res = await API.get("/cart");
      if (res.data?.success) setCart(res.data.cart);
    }
  };

  
  const clearCart = async () => {
    try {
      setCart([]);
      await API.delete("/cart");
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};