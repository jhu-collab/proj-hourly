import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();


  return isAuthenticated() ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace={true} />
  );
}

export default ProtectedRoute;
