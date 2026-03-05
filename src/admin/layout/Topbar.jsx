// src/admin/layout/Topbar.jsx

import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const Topbar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xl text-gray-700 hover:text-black transition"
        >
          <FaBars />
        </button>

        <h1 className="text-xl font-semibold text-gray-700">
          Admin Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-600">
          {user?.name || "Admin"}
        </span>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;