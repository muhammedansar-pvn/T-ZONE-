// src/admin/layout/AdminLayout.jsx
import Navbar from "../../Components/Navbar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <div className="flex-1 flex flex-col">
        <Navbar/>
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
