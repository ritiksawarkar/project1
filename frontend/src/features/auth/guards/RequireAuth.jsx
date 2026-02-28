import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../model/useAuth.js";

function RequireAuth({ children, redirectTo = routePaths.login }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}

export default RequireAuth;
