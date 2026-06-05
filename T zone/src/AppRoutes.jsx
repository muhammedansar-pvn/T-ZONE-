import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

// Customer Pages
import Home from "./Pages/Home";
import Watches from "./Pages/Watches";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProductView from "./Pages/ProductView";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Orders from "./Pages/Orders";
import Profile from "./Pages/Profile";
import Wishlist from "./Pages/Wishlist";

// Protected Route
import ProtectedRoute from "./Components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Admin Layout & Pages
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import ProductsList from "./admin/pages/products/ProductsList";
import AddProduct from "./admin/pages/products/AddProduct";
import EditProduct from "./admin/pages/products/EditProduct";
import OrdersManagement from "./admin/pages/orders/OrdersManagement";
import Users from "./admin/pages/users/Users";
import UserDetails from "./admin/pages/users/UserDetails";

// Layouts
import UserLayout from "./admin/layout/UserLayout";

// Context Hook
import { useAuth } from "./Context/AuthContext";

const AppRoutes = () => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (!authLoading && user?.role === "admin" && location.pathname === "/") {
      navigate("/admin", { replace: true });
    }
  }, [user, authLoading, location.pathname, navigate]);

  return (
    <>
      {/* ✅ Toaster OUTSIDE Routes */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<UserLayout />}>
          {/* PUBLIC */}
          <Route index element={<Home />} />
          <Route path="watches" element={<Watches />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="product/:id" element={<ProductView />} />

          {/* PROTECTED */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Products */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />

          {/* Users */}
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />

          {/* Orders */}
          <Route path="ordersmanegment" element={<OrdersManagement />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;