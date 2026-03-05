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
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

      setOrders(userOrders);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ================= CANCEL FULL ORDER ================= */

  const cancelFullOrder = async (orderId) => {
    try {
      setLoading(true);
      await cancelOrder(orderId);
      await fetchOrders();
    } catch {
      setError("Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RETURN ORDER ================= */

  const returnOrder = async (orderId) => {
    try {
      setLoading(true);

      // update status to Return Requested
      await updateOrderStatus(orderId, "Return Requested");

      await fetchOrders();
    } catch {
      setError("Failed to request return.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CANCEL ITEM ================= */

  const cancelItem = async (orderId, productId) => {
    try {
      setLoading(true);
      await cancelSingleItem(orderId, productId);
      await fetchOrders();
    } catch {
      setError("Failed to cancel item.");
    } finally {
      setLoading(false);
    }
  };

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

