import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoutes() {
  const isLoggedIn = !!localStorage.getItem("authToken");
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes;
