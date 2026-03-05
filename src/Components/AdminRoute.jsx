// src/Components/AdminRoute.jsx

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useContext(AuthContext);

  // If not logged in OR not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;