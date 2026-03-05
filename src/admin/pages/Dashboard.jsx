import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE = "http://localhost:5000";

const STATUS_COLORS = {
  delivered: "#16a34a",
  cancelled: "#dc2626",
  processing: "#f59e0b",
  pending: "#6b7280",
  shipped: "#2563eb",
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [filterDays, setFilterDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/users`),
          axios.get(`${API_BASE}/orders`),
        ]);

        const orders = ordersRes.data || [];
        const products = productsRes.data || [];

        const now = new Date();

        /* ================= FILTER ORDERS ================= */

        const filteredOrders = orders.filter((order) => {
          if (filterDays === "all") return true;

          const orderDate = new Date(order.createdAt || order.date);
          const diff = (now - orderDate) / (1000 * 60 * 60 * 24);

          return diff <= filterDays;
        });

        /* ================= TOTAL REVENUE ================= */

        const totalRevenue = filteredOrders.reduce((total, order) => {
          const orderTotal =
            order.products?.reduce((sum, p) => sum + p.price * p.quantity, 0) ||
            0;

          return total + orderTotal;
        }, 0);

        /* ================= REVENUE CHART DATA ================= */

        const revenueMap = {};

        filteredOrders.forEach((order) => {
          const date = new Date(order.createdAt || order.date);

          const key = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });

          const amount =
            order.products?.reduce((sum, p) => sum + p.price * p.quantity, 0) ||
            0;

          revenueMap[key] = (revenueMap[key] || 0) + amount;
        });

        const chartArray = Object.keys(revenueMap).map((key) => ({
          date: key,
          revenue: revenueMap[key],
        }));

        /* ================= ORDER STATUS ================= */

        const statusMap = {};

        orders.forEach((order) => {
          const status = order.status || "pending";

          statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const statusData = Object.keys(statusMap).map((status) => ({
          name: status,
          value: statusMap[status],
        }));

        /* ================= RECENT ORDERS ================= */

        const recent = orders
          .slice(-5)
          .reverse()
          .map((order) => {
            const amount =
              order.products?.reduce(
                (sum, p) => sum + p.price * p.quantity,
                0
              ) || 0;

            return {
              ...order,
              totalAmount: amount,
            };
          });

        /* ================= TOP PRODUCTS ================= */

        const productSales = {};

        orders.forEach((order) => {
          order.products?.forEach((p) => {
            productSales[p.name] = (productSales[p.name] || 0) + p.quantity;
          });
        });

        const top = Object.keys(productSales)
          .map((name) => ({
            name,
            sales: productSales[name],
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setStats({
          revenue: totalRevenue,
          orders: orders.length,
          users: usersRes.data.length,
          products: products.length,
        });

        setChartData(chartArray);
        setOrderStatusData(statusData);
        setRecentOrders(recent);
        setTopProducts(top);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [filterDays]);

  const getStatusBadge = (status) => {
    const color = STATUS_COLORS[status?.toLowerCase()] || "#6b7280";

    return (
      <span
        className="px-3 py-1 rounded-full text-xs text-white"
        style={{ backgroundColor: color }}
      >
        {status}
      </span>
    );
  };

  if (loading) return <p>Loading Dashboard...</p>;

  return (
    <div className="space-y-8">

      <h2 className="text-3xl font-bold">Admin Dashboard</h2>

      {/* FILTER */}
      <div className="flex gap-3">
        {[7, 30, 90, "all"].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDays(d)}
            className={`px-4 py-2 rounded ${
              filterDays === d
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {d === "all" ? "All Time" : `${d} Days`}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          color="text-green-600"
        />

        <Card title="Total Orders" value={stats.orders} color="text-blue-600" />

        <Card title="Total Users" value={stats.users} color="text-purple-600" />

        <Card title="Products" value={stats.products} color="text-yellow-600" />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* REVENUE */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h3 className="mb-4 font-semibold">
            Revenue Trend (Last {filterDays === "all" ? "All Time" : `${filterDays} Days`})
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* ORDER STATUS */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h3 className="mb-4 font-semibold">Order Status</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>

              <Pie
                data={orderStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {orderStatusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      STATUS_COLORS[entry.name.toLowerCase()] || "#4F46E5"
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h3 className="mb-4 font-semibold">Recent Orders</h3>

        <table className="w-full text-left">

          <thead>
            <tr className="border-b">
              <th className="py-2">Order</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">

                <td>#{o.id}</td>

                <td>{o.customerName || "N/A"}</td>

                <td>₹{o.totalAmount.toLocaleString()}</td>

                <td>{getStatusBadge(o.status)}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* TOP PRODUCTS */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h3 className="mb-4 font-semibold">Top Selling Products</h3>

        {topProducts.map((p, i) => (
          <div key={i} className="flex justify-between border-b py-2">

            <span>{p.name}</span>

            <span className="font-semibold">{p.sales} sold</span>

          </div>
        ))}

      </div>

    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

    <h3 className="text-gray-500">{title}</h3>

    <p className={`text-2xl font-bold ${color}`}>{value}</p>

  </div>
);

export default Dashboard;