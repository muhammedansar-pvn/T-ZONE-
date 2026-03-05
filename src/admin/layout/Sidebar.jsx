// src/layouts/Sidebar.jsx

import { NavLink } from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaTachometerAlt,
} from "react-icons/fa";

const Sidebar = ({ collapsed }) => {
  const linkStyle =
    "flex items-center gap-3 px-3 py-2 rounded transition duration-200";

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-black text-white p-5 
      transition-all duration-300 z-50
      ${collapsed ? "w-20" : "w-64"}`}
    >
      <h2 className="text-2xl font-bold mb-8">
        {collapsed ? "AP" : "Admin Panel"}
      </h2>

      {/* Dashboard */}
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          `${linkStyle} ${
            isActive
              ? "bg-yellow-500 text-black"
              : "hover:bg-gray-800"
          }`
        }
      >
        <FaTachometerAlt />
        {!collapsed && "Dashboard"}
      </NavLink>

      {/* Products */}
      <NavLink
        to="/admin/products"
        className={({ isActive }) =>
          `${linkStyle} ${
            isActive
              ? "bg-yellow-500 text-black"
              : "hover:bg-gray-800"
          }`
        }
      >
        <FaBox />
        {!collapsed && "Products"}
      </NavLink>

      {/* Users */}
      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          `${linkStyle} ${
            isActive
              ? "bg-yellow-500 text-black"
              : "hover:bg-gray-800"
          }`
        }
      >
        <FaUsers />
        {!collapsed && "Users"}
      </NavLink>

      {/* Orders */}
      <NavLink
        to="/admin/ordersmanegment"
        className={({ isActive }) =>
          `${linkStyle} ${
            isActive
              ? "bg-yellow-500 text-black"
              : "hover:bg-gray-800"
          }`
        }
      >
        <FaShoppingCart />
        {!collapsed && "Orders"}
      </NavLink>
    </div>
  );
};

export default Sidebar;