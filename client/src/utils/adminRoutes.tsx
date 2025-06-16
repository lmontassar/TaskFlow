import { Outlet, Navigate } from "react-router-dom";

function AdminRoutes(user: any) {
  return user?.role === "ADMIN" ? (
    <Navigate to="/admin" />
  ) : (
    <Navigate to="/" />
  );
}

export default AdminRoutes;
