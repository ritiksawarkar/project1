import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import api from "../../../shared/api/api.js";
import { cn } from "../../../shared/lib/utils.js";
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

function AdminOverviewPage() {
  const { accessToken } = useAuth();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshOverview = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      setError("Authentication is required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/overview");
      const payload = response.data?.data;

      setOverview(payload ?? null);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load admin overview.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refreshOverview();
  }, [refreshOverview]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="neutral">Protected · Admin Role Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Oversight
        </h1>
        <p className="text-sm text-slate-600">
          Monitor platform trust, compliance, and operational escalations across
          all missions.
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Loading admin overview...
            </CardTitle>
            <CardDescription>
              Syncing aggregate metrics from backend.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Unable to load admin overview
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="secondary" onClick={refreshOverview}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users</CardTitle>
              <CardDescription>Current platform user accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-slate-700">
              <p>Total: {overview?.users?.total ?? 0}</p>
              <p>Active: {overview?.users?.active ?? 0}</p>
              <p>Inactive: {overview?.users?.inactive ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Missions</CardTitle>
              <CardDescription>Mission lifecycle distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-slate-700">
              <p>Total: {overview?.missions?.total ?? 0}</p>
              <p>Open: {overview?.missions?.open ?? 0}</p>
              <p>Closed: {overview?.missions?.closed ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proof & Assignment</CardTitle>
              <CardDescription>
                Operational verification pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-slate-700">
              <p>Active Assignments: {overview?.assignments?.active ?? 0}</p>
              <p>Pending Proofs: {overview?.proofs?.pending ?? 0}</p>
              <p>Verified Proofs: {overview?.proofs?.verified ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Workflow</CardTitle>
          <CardDescription>
            Open the dedicated queue to review submitted mission proofs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to={routePaths.proofReview}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Open Proof Review Queue
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

export default AdminOverviewPage;
