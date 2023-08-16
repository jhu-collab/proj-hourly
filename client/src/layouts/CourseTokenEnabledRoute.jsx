import { Outlet } from "react-router-dom";
import useQueryMyRole from "../hooks/useQueryMyRole";
import NotAllowed from "../pages/NotAllowed";

function CourseTokenEnabledRoute() {
  const { data } = useQueryMyRole();
  return data.course.usesTokens ? <Outlet /> : <NotAllowed />;
}

export default CourseTokenEnabledRoute;
