import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { Button } from "../../../shared/ui/button/Button.jsx";
import { buttonVariants } from "../../../shared/ui/button/buttonVariants.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { Input } from "../../../shared/ui/input/Input.jsx";
import { cn } from "../../../shared/lib/utils.js";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      fullName.trim().length >= 2 &&
      email.trim().length > 4 &&
      password.trim().length >= 8 &&
      confirmPassword.trim().length >= 8,
    [confirmPassword, email, fullName, password],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!canSubmit) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Email format appears invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password must match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const result = await register({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    if (!result.ok) {
      setIsSubmitting(false);
      setErrorMessage(result.error ?? "Registration failed. Please try again.");
      return;
    }

    setSuccessMessage("Registration successful. Redirecting to login...");
    navigate(routePaths.login, {
      replace: true,
      state: {
        registrationSuccess:
          "Account created successfully. Please sign in to continue.",
      },
    });
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-50 to-white p-1">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="info" className="w-fit">
              Account Onboarding
            </Badge>
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-tight text-slate-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Register once to access mission workflows, assignments, and
                reviews.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="register-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <Input
                  id="register-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="register-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@organization.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="register-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="pr-20"
                    autoComplete="new-password"
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

              <div className="space-y-1.5">
                <label
                  htmlFor="register-confirm-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
                    className="pr-20"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    onClick={() =>
                      setShowConfirmPassword((currentValue) => !currentValue)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <p className="min-h-5 text-sm text-red-600">
                {errorMessage || "\u00A0"}
              </p>
              <p className="min-h-5 text-sm text-emerald-700">
                {successMessage || "\u00A0"}
              </p>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
                <Link
                  to={routePaths.login}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "md" }),
                  )}
                >
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default RegisterPage;
