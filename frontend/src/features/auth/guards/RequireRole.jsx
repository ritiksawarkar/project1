import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../model/useAuth.js";
import { hasAnyAllowedRole } from "./authorization.js";

function RequireRole({
  role,
  allowedRoles,
  children,
  unauthenticatedRedirectTo = routePaths.login,
  unauthorizedRedirectTo = routePaths.home,
}) {
  const { isAuthenticated, isInitializing, currentRole } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-slate-600">Validating permissions...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={unauthenticatedRedirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  const normalizedAllowedRoles =
    Array.isArray(allowedRoles) && allowedRoles.length > 0
      ? allowedRoles
      : role
        ? [role]
        : [];

  const isAllowed = hasAnyAllowedRole(currentRole, normalizedAllowedRoles);

  if (!isAllowed) {
    return (
      <Navigate
        to={unauthorizedRedirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}

export default RequireRole;
