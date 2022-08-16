import { Navigate, Outlet } from "react-router-dom";

/**
 * Reusable component that provides authorization for Route components.
 * @param {boolean} isAllowed (required) condition that verifies whether
 *                            the user is permitted to access the Route
 * @param {string} redirectPath (optional) the path that the user should
 *                              be redirected to if permissions were not
 *                              met
 * @param {*} children (optional) children to fill up the component
 * @returns Reusable popup component.
 */
function ProtectedRoute({ isAllowed, redirectPath = "/", children }) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
