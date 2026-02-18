import { getOrders, cancelOrder } from "../services/orderService";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../Context/AuthContext";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const userOrders = getOrders().filter(
      (order) => order.userEmail === user?.email
    );
    setOrders(userOrders);
  }, [user]);

  const refreshOrders = () => {
    const updatedOrders = getOrders().filter(
      (order) => order.userEmail === user?.email
    );
    setOrders(updatedOrders);
  };

  const handleCancel = (id) => {
    if (window.confirm("Cancel this order?")) {
      cancelOrder(id);
      refreshOrders();
    }
  };

  const handleReturn = (id) => {
    alert("Return request submitted!");
  };

  const handleRate = () => {
    const rating = prompt("Rate this order (1-5)");
    if (rating) alert("Thanks for rating ");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600";
      case "Shipped":
      case "Out for Delivery":
        return "bg-blue-600";
      case "Processing":
      case "Placed":
        return "bg-yellow-500 text-black";
      case "Cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case "Placed":
        return "25%";
      case "Processing":
        return "40%";
      case "Shipped":
        return "60%";
      case "Out for Delivery":
        return "80%";
      case "Delivered":
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8 text-yellow-500">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">
                  Date: {order.date}
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                <p className="mt-2 font-semibold">
                  Total: ₹ {order.total}
                </p>

                {/* Progress Bar */}
                {order.status !== "Cancelled" && (
                  <div className="mt-3 bg-gray-700 h-2 rounded">
                    <div
                      className="bg-yellow-500 h-2 rounded"
                      style={{ width: getProgressWidth(order.status) }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">

                {/* View */}
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id
                        ? null
                        : order.id
                    )
                  }
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
                >
                  {expandedOrder === order.id
                    ? "Hide"
                    : "View"}
                </button>

                {/* Cancel */}
                {(order.status === "Placed" ||
                  order.status === "Processing") && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                )}

                {/* Track */}
                {(order.status === "Shipped" ||
                  order.status === "Out for Delivery") && (
                  <button
                    onClick={() =>
                      alert("Tracking ID: TZ" + order.id)
                    }
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
                  >
                    Track
                  </button>
                )}

                {/* Return */}
                {order.status === "Delivered" && (
                  <>
                    <button
                      onClick={() => handleReturn(order.id)}
                      className="bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg"
                    >
                      Return
                    </button>

                    <button
                      onClick={handleRate}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg"
                    >
                      Rate
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            {expandedOrder === order.id && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2"
                  >
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} x ₹ {item.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
