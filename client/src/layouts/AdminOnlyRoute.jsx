import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import NotAllowed from "../pages/NotAllowed";

function AdminOnlyRoute() {
  const { isAdmin } = useAuth();

  return isAdmin() ? <Outlet /> : <NotAllowed />;
}

export default AdminOnlyRoute;
