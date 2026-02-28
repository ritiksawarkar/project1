import { Link } from "react-router-dom";
import { authRoles } from "../../../features/auth/model/authRoles.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { appConfig } from "../../../shared/config/appConfig.js";
import { routePaths } from "../../router/routePaths.js";

function AppFooter() {
  const { isAuthenticated, currentRole } = useAuth();

  const quickLinks = [
    { label: "Home", path: routePaths.home, visible: true },
    { label: "Login", path: routePaths.login, visible: !isAuthenticated },
    {
      label: "Register",
      path: routePaths.register,
      visible: !isAuthenticated,
    },
    {
      label: "Missions",
      path: routePaths.missions,
      visible: isAuthenticated,
    },
    {
      label: "Assignments",
      path: routePaths.assignments,
      visible: isAuthenticated,
    },
    {
      label: "Admin",
      path: routePaths.admin,
      visible: isAuthenticated && currentRole === authRoles.admin,
    },
  ].filter((item) => item.visible);

  const legalLinks = [
    { label: "Privacy", path: routePaths.home },
    { label: "Terms", path: routePaths.home },
    { label: "Compliance", path: routePaths.home },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">
              {appConfig.appName}
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Mission operations platform for high-trust donation coordination,
              dispatch, and proof verification.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Quick Links</p>
            <nav
              aria-label="Footer quick links"
              className="mt-3 flex flex-col gap-2"
            >
              {quickLinks.map((linkItem) => (
                <Link
                  key={linkItem.path}
                  to={linkItem.path}
                  className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  {linkItem.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Legal</p>
            <nav
              aria-label="Footer legal links"
              className="mt-3 flex flex-col gap-2"
            >
              {legalLinks.map((linkItem) => (
                <Link
                  key={linkItem.label}
                  to={linkItem.path}
                  className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                >
                  {linkItem.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {appConfig.appName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
