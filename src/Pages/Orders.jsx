import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrderCard from "../Components/orders/OrderCard";
import { useOrders } from "../hooks/useOrder";

const Orders = () => {
  const { user } = useContext(AuthContext);
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

  //  Protect Route
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  //  Calculate Order Total
  const getOrderTotal = (order) => {
    return (order?.products || []).reduce((sum, product) => {
      return sum + Number(product.price) * Number(product.quantity);
    }, 0);
  };

  //  Filtering + Sorting Logic
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by Order Status
    if (filter !== "All") {
      filtered = filtered.filter(
        (order) =>
          order?.status?.toLowerCase() ===
          filter.toLowerCase()
      );
    }

    // Search by Order ID
    if (search.trim()) {
      filtered = filtered.filter((order) =>
        order?.id
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Sorting (No mutation bug)
    if (sort === "Oldest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
    }

    if (sort === "Newest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    return filtered;
  }, [orders, search, filter, sort]);

  //  Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">Loading Orders...</p>
      </div>
    );
  }

  //  Error State
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

          {/* Search */}
          <input
            type="text"
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none"
          />

          {/* Status Filter */}
          <select
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

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        {/* ORDERS LIST */}
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