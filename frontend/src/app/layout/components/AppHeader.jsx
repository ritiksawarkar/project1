import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { authRoles } from "../../../features/auth/model/authRoles.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { appConfig } from "../../../shared/config/appConfig.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { buttonVariants } from "../../../shared/ui/button/buttonVariants.js";
import { cn } from "../../../shared/lib/utils.js";
import { routePaths } from "../../router/routePaths.js";

function AppHeader() {
  const { isAuthenticated, currentRole, currentUserName, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = useMemo(
    () =>
      [
        {
          label: "Home",
          path: routePaths.home,
          visible: true,
        },
        {
          label: "Missions",
          path: routePaths.missions,
          visible: isAuthenticated,
        },
        {
          label: "Assignments",
          path: routePaths.assignments,
          visible: isAuthenticated && currentRole === authRoles.admin,
        },
        {
          label: "Proof Review",
          path: routePaths.proofReview,
          visible: isAuthenticated && currentRole === authRoles.admin,
        },
        {
          label: "Admin",
          path: routePaths.admin,
          visible: isAuthenticated && currentRole === authRoles.admin,
        },
      ].filter((item) => item.visible),
    [currentRole, isAuthenticated],
  );

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            to={routePaths.home}
            className="inline-flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
              SM
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {appConfig.appName}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
                end
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Badge variant="neutral">
                  {currentUserName ?? "Authenticated User"}
                </Badge>
                <Link
                  to={routePaths.missions}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                  )}
                  onClick={handleSignOut}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={routePaths.login}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  Login
                </Link>
                <Link
                  to={routePaths.register}
                  className={cn(
                    buttonVariants({ variant: "primary", size: "sm" }),
                  )}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-slate-200 py-3 lg:hidden">
            <nav aria-label="Mobile primary" className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    )
                  }
                  end
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={routePaths.missions}
                    onClick={closeMobileMenu}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                    )}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={routePaths.login}
                    onClick={closeMobileMenu}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Login
                  </Link>
                  <Link
                    to={routePaths.register}
                    onClick={closeMobileMenu}
                    className={cn(
                      buttonVariants({ variant: "primary", size: "sm" }),
                    )}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default AppHeader;
