import { useEffect, useState, useMemo, useRef } from "react";

const ORDER_STATUSES = [
  "Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const firstLoad = useRef(true);

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-300";
      case "Processing":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Shipped":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "Placed":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/orders");
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const formatted = data.map((order) => {
        // If customer cancelled whole order
        if (order.status === "Cancelled") {
          return {
            ...order,
            products: (order.products || []).map((p) => ({
              ...p,
              status: "Cancelled",
            })),
          };
        }
        return order;
      });

      setOrders(formatted.filter((o) => !o.isDeleted));

      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ================= UPDATE PRODUCT ================= */
  const updateProductStatus = async (orderId, index, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (order.status === "Cancelled" || order.status === "Delivered")
      return;

    const updatedProducts = [...order.products];

    updatedProducts[index] = {
      ...updatedProducts[index],
      status: newStatus,
    };

    if (
      newStatus === "Delivered" &&
      order.paymentMethod === "Cash on Delivery"
    ) {
      updatedProducts[index].paymentStatus = "Paid";
    }

    /* ===== OVERALL STATUS ===== */
    let overallStatus = "Placed";

    const allCancelled = updatedProducts.every(
      (p) => p.status === "Cancelled"
    );
    const allDelivered = updatedProducts.every(
      (p) => p.status === "Delivered"
    );
    const anyOut = updatedProducts.some(
      (p) => p.status === "Out for Delivery"
    );
    const anyShipped = updatedProducts.some(
      (p) => p.status === "Shipped"
    );
    const anyProcessing = updatedProducts.some(
      (p) => p.status === "Processing"
    );

    if (allCancelled) overallStatus = "Cancelled";
    else if (allDelivered) overallStatus = "Delivered";
    else if (anyOut) overallStatus = "Out for Delivery";
    else if (anyShipped) overallStatus = "Shipped";
    else if (anyProcessing) overallStatus = "Processing";

    try {
      await fetch(`http://localhost:5000/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: updatedProducts,
          status: overallStatus,
        }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, products: updatedProducts, status: overallStatus }
            : o
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.customerName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter ||
        (order.products || []).some(
          (p) => p.status === statusFilter
        );

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8">
        Orders Management
      </h2>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="All">All</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          No orders found
        </div>
      ) : (
        filteredOrders.map((order) => {
          const locked =
            order.status === "Cancelled" ||
            order.status === "Delivered";

          return (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow mb-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>
                  <p className="font-semibold">{order.id}</p>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Products */}
              {(order.products || []).map((product, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-t"
                >
                  <div>
                    <p className="font-medium">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹ {product.price} × {product.quantity}
                    </p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <select
                      disabled={locked}
                      value={product.status}
                      onChange={(e) =>
                        updateProductStatus(
                          order.id,
                          i,
                          e.target.value
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        product.status
                      )} ${
                        locked
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <span className="text-sm font-medium">
                      {product.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrdersManagement;