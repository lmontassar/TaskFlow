import { Outlet, Navigate } from "react-router-dom";

function ProtectedLoginRoutes() {
  const isLoggedIn = !!localStorage.getItem("authToken");

  return !isLoggedIn ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default ProtectedLoginRoutes;
