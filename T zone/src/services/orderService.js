// services/orderService.js

import API from "../config/api";

/* ================================
   GET ALL ORDERS
================================ */
export const getOrders = async () => {
  try {
    const res = await API.get("/orders");
    return res.data;
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    return [];
  }
};

/* ================================
   SAVE NEW ORDER (WITH STOCK REDUCE)
================================ */
export const saveOrder = async (orderData) => {
  try {
    // 🔥 Validate & Reduce Stock
    for (const item of orderData.products) {
      const { data: product } = await API.get(`/products/${item.productId}`);

      if (!product) throw new Error("Product not found");

      if ((product.stock || 0) < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      await API.patch(`/products/${item.productId}`, {
        stock: product.stock - item.quantity,
      });
    }

    // 🔥 Save Order
    const res = await API.post("/orders", {
      ...orderData,
      status: "Placed",
      createdAt: new Date().toISOString(),
    });

    return res.data;
  } catch (error) {
    console.error("Save error:", error.response?.data || error.message);
    throw error;
  }
};

/* ================================
   CANCEL FULL ORDER (RESTORE STOCK)
================================ */
export const cancelOrder = async (orderId) => {
  try {
    const { data: order } = await API.get(`/orders/${String(orderId)}`);

    if (!order) throw new Error("Order not found");

    if (order.status === "Delivered") {
      throw new Error("Delivered order cannot be cancelled");
    }

    // 🔥 Restore Stock
    for (const item of order.products) {
      const { data: product } = await API.get(`/products/${item.productId}`);

      await API.patch(`/products/${item.productId}`, {
        stock: (product.stock || 0) + item.quantity,
      });
    }

    // 🔥 Update Order Status
    const { data } = await API.patch(`/orders/${String(orderId)}`, {
      status: "Cancelled",
    });

    return data;
  } catch (error) {
    console.error("Cancel error:", error.response?.data || error.message);
    throw error;
  }
};

/* ================================
   CANCEL SINGLE ITEM (RESTORE 1 STOCK)
================================ */
export const cancelSingleItem = async (orderId, productId) => {
  try {
    const { data: order } = await API.get(`/orders/${String(orderId)}`);

    if (!order) throw new Error("Order not found");

    if (order.status === "Delivered") {
      throw new Error("Delivered order cannot be cancelled");
    }

    const item = order.products.find(
      (p) => String(p.productId) === String(productId)
    );

    if (!item) throw new Error("Product not found in order");

    // 🔥 Restore 1 quantity to stock
    const { data: product } = await API.get(`/products/${productId}`);

    await API.patch(`/products/${productId}`, {
      stock: (product.stock || 0) + 1,
    });

    // 🔥 Reduce quantity in order
    const updatedProducts = order.products
      .map((p) =>
        String(p.productId) === String(productId)
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
      .filter((p) => p.quantity > 0);

    const newTotal = updatedProducts.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const { data } = await API.patch(`/orders/${String(orderId)}`, {
      products: updatedProducts,
      totalAmount: newTotal,
    });

    return data;
  } catch (error) {
    console.error(
      "Single cancel error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ================================
   UPDATE ORDER STATUS
================================ */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const res = await API.patch(`/orders/${String(orderId)}`, {
      status: newStatus,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Status update error:",
      error.response?.data || error.message
    );
    throw error;
  }
};