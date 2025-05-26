import { Outlet, Navigate } from "react-router-dom";

function AdminRoutes(user: any) {
  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/" />;
}

export default AdminRoutes;
