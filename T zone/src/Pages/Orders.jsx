import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrderCard from "../Components/orders/OrderCard";
import { useOrders } from "../hooks/useOrders";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    orders = [],
    loading,
    error,
    cancelFullOrder,
    returnOrder,
    cancelItem,
    refreshOrders,
  } = useOrders(user);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  // 🔐 Protect Route
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 💰 Order Total
  const getOrderTotal = useCallback((order) => {
    return (order?.products || []).reduce((sum, product) => {
      return sum + Number(product.price || 0) * Number(product.quantity || 0);
    }, 0);
  }, []);

  // 🔍 Filter + Sort
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    let filtered = [...orders];

    if (filter !== "All") {
      filtered = filtered.filter(
        (order) =>
          order?.status?.toLowerCase() === filter.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter((order) =>
        String(order?.id || "").toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0);
      const dateB = new Date(b?.createdAt || 0);

      return sort === "Oldest"
        ? dateA - dateB
        : dateB - dateA;
    });

    return filtered;
  }, [orders, search, filter, sort]);

  // 🚫 No user
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">Loading Orders...</p>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-16 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-yellow-500 mb-8">
          Order History
        </h1>

        {/* FILTER SECTION */}
        <div className="flex flex-wrap gap-4 mb-8">

          {/* 🔍 Search */}
          <label htmlFor="search" className="sr-only">
            Search Order
          </label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none"
          />

          {/* 📌 Filter */}
          <label htmlFor="statusFilter" className="sr-only">
            Filter Orders
          </label>
          <select
            id="statusFilter"
            name="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none"
          >
            <option value="All">All</option>
            <option value="Placed">Placed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">
              Out for Delivery
            </option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* 🔄 Sort */}
          <label htmlFor="sortOrder" className="sr-only">
            Sort Orders
          </label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>

        </div>

        {/* 📦 ORDERS */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No Orders Found
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order?.id}
                order={order}
                orderTotal={getOrderTotal(order)}
                onCancelOrder={cancelFullOrder}
                onReturnOrder={returnOrder}
                onCancelItem={cancelItem}
                onPaymentSuccess={refreshOrders}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;