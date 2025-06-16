import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoutes() {
  if (localStorage.getItem("token")) {
    return <Navigate to="/emailverification" />;
  }
  const isLoggedIn = !!localStorage.getItem("authToken");
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes;
