import { Outlet } from "react-router-dom";
import useQueryMyRole from "../hooks/useQueryMyRole";
import NotAllowed from "../pages/NotAllowed";

function StaffOnlyRoute() {
  const { data } = useQueryMyRole();
  const isStaff = data?.role === "Instructor" || data?.role === "Staff";

  return isStaff ? <Outlet /> : <NotAllowed />;
}

export default StaffOnlyRoute;
