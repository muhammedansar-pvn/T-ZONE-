// src/admin/layout/AdminLayout.jsx

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Sidebar (Fixed) */}
      <Sidebar collapsed={collapsed} />

      {/* Main Section */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;