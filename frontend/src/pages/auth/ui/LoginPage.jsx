import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { Button, buttonVariants } from "../../../shared/ui/button/Button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { Input } from "../../../shared/ui/input/Input.jsx";
import { cn } from "../../../shared/lib/utils.js";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 4 && password.trim().length >= 6,
    [email, password],
  );

  const fromPath = location.state?.from?.pathname;
  const registrationSuccessMessage =
    typeof location.state?.registrationSuccess === "string"
      ? location.state.registrationSuccess
      : "";
  const nextPath =
    typeof fromPath === "string" ? fromPath : routePaths.missions;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!canSubmit) {
      setErrorMessage("Please enter a valid email and password.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Email format appears invalid.");
      return;
    }

    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    const loginResult = await signIn({
      email: normalizedEmail,
      password,
    });

    if (!loginResult.ok) {
      setIsSubmitting(false);
      setErrorMessage(loginResult.error ?? "Unable to sign in.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("social-mentor-remember-email", normalizedEmail);
    } else {
      localStorage.removeItem("social-mentor-remember-email");
    }

    navigate(nextPath, { replace: true });
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-50 to-white p-1">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="info" className="w-fit">
              Secure Access
            </Badge>
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-tight text-slate-900">
                Login to your account
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Continue to mission operations, dispatch workflows, and proof
                reviews.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {registrationSuccessMessage ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {registrationSuccessMessage}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@organization.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="pr-20"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  Remember me
                </label>

                <Link
                  to={routePaths.register}
                  className="text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <p className="min-h-5 text-sm text-red-600">
                {errorMessage || "\u00A0"}
              </p>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                <Link
                  to={routePaths.register}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "md" }),
                  )}
                >
                  Create new account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default LoginPage;
