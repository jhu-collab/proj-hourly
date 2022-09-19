import { Outlet, Navigate } from "react-router-dom";
import WindowFocusHandler from "../components/WindowFocusHandler";
import useAuth from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? (
    <>
      <WindowFocusHandler />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace={true} />
  );
}

export default ProtectedRoute;
