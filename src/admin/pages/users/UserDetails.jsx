import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER + ORDERS ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          `${API_BASE}/users/${id}`
        );

        const ordersRes = await axios.get(
          `${API_BASE}/orders`
        );

        const userOrders = ordersRes.data.filter(
          order =>
            order.userEmail === userRes.data.email &&
            !order.isDeleted
        );

        setUser(userRes.data);

        
        if (userRes.data.role !== "admin") {
          setOrders(userOrders);
        }
      } catch (error) {
        console.error("Error loading user");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= TOTAL SPENT ================= */
  const totalSpent = useMemo(() => {
    return orders.reduce((total, order) => {
      return (
        total +
        (order.products || []).reduce(
          (sum, p) =>
            p.paymentStatus === "Paid" &&
            p.status === "Delivered"
              ? sum +
                Number(p.price) *
                  Number(p.quantity)
              : sum,
          0
        )
      );
    }, 0);
  }, [orders]);

  if (loading)
    return <p className="p-6">Loading...</p>;

  if (!user)
    return <p className="p-6">User not found</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">
        User Details
      </h2>

      {/* USER INFO */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p>
          <strong>Status:</strong>{" "}
          {user.isBlocked ? "Blocked" : "Active"}
        </p>
      </div>

    
      {user.role !== "admin" && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-black text-white p-4 rounded">
              <p>Total Orders</p>
              <h2 className="text-xl font-bold">
                {orders.length}
              </h2>
            </div>

            {/* <div className="bg-green-700 text-white p-4 rounded">
              <p>Total Spent</p>
              <h2 className="text-xl font-bold">
                ₹ {totalSpent}
              </h2>
            </div> */}
          </div>

          {/* ORDER HISTORY */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">
              Order History
            </h3>

            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="border-b py-3"
                >
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                  <div className="mt-2 ml-4">
                    {(order.products || []).map(
                      (p, index) => (
                        <p key={index}>
                          • {p.name} — ₹
                          {p.price} × {p.quantity} (
                          {p.status})
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;