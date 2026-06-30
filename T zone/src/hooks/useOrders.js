import { useState, useEffect, useCallback } from "react";
import {
  getOrders,
  cancelOrder,
  cancelSingleItem,
  updateOrderStatus,
} from "../services/orderService";

export const useOrders = (user) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH ================= */

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const allOrders = await getOrders();

      
      const userOrders = allOrders
        .filter((order) => order.userEmail === user.email)
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

      setOrders(userOrders);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ================= CANCEL FULL ORDER ================= */

  const cancelFullOrder = useCallback(async (orderId) => {
    try {
      
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "Cancelled" }
            : order
        )
      );

      await cancelOrder(orderId);
    } catch {
      setError("Failed to cancel order.");
      fetchOrders(); 
    }
  }, [fetchOrders]);

  /* ================= RETURN ORDER ================= */

  const returnOrder = useCallback(async (orderId) => {
    try {
      
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "Return Requested" }
            : order
        )
      );

      await updateOrderStatus(orderId, "Return Requested");
    } catch {
      setError("Failed to request return.");
      fetchOrders();
    }
  }, [fetchOrders]);

  /* ================= CANCEL ITEM ================= */

  const cancelItem = useCallback(async (orderId, productId) => {
    try {
      
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;

          return {
            ...order,
            products: order.products.map((item) =>
              item.productId === productId
                ? { ...item, status: "Cancelled" }
                : item
            ),
          };
        })
      );

      await cancelSingleItem(orderId, productId);
    } catch {
      setError("Failed to cancel item.");
      fetchOrders();
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    cancelFullOrder,
    cancelItem,
    returnOrder,
    refreshOrders: fetchOrders,
  };
};