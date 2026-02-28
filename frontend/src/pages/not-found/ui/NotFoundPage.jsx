import { Link } from "react-router-dom";
import { buttonVariants } from "../../../shared/ui/button/Button.jsx";
import { cn } from "../../../shared/lib/utils.js";
import { routePaths } from "../../../app/router/routePaths.js";

function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>

        <Link
          to={routePaths.home}
          className={cn(
            buttonVariants({ variant: "primary", size: "md" }),
            "mt-6",
          )}
        >
          Go to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
