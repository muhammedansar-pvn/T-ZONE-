import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // 🔥 Dynamic Key Based On User
  const getCartKey = () => {
    return user ? `cart_${user.id}` : null;
  };

  // ✅ Load Cart Based On Logged User
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!user) {
      setCart([]); // 🚀 Clear when logout
      return;
    }

    try {
      const storedCart = localStorage.getItem(getCartKey());
      setCart(storedCart ? JSON.parse(storedCart) : []);
    } catch {
      setCart([]);
    }
  }, [user]);

  // ✅ Sync Cart To LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }
  }, [cart, user]);

  // ================= ADD TO CART =================
  const addToCart = (product) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      const requestedQty = product.quantity || 1;

      if (product.stock <= 0) {
        alert("Out of Stock");
        return prevCart;
      }

      if (existing) {
        const newQuantity = existing.quantity + requestedQty;

        if (newQuantity > product.stock) {
          alert(`Only ${product.stock} items available`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (requestedQty > product.stock) {
        alert(`Only ${product.stock} items available`);
        return prevCart;
      }

      return [...prevCart, { ...product, quantity: requestedQty }];
    });
  };

  // ================= REMOVE =================
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ================= UPDATE =================
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (newQuantity > item.stock) {
            alert(`Only ${item.stock} items available`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // ================= CLEAR =================
  const clearCart = () => {
    if (user) {
      localStorage.removeItem(getCartKey());
    }
    setCart([]);
  };

  // ================= TOTALS =================
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
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