import { useState } from "react";
import { Link } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import { formatDateTime } from "../../../features/missions/lib/missionPresentation.js";
import { proofStatuses } from "../../../features/proofs/model/proofConstants.js";
import { useProofs } from "../../../features/proofs/model/useProofs.js";
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
import { cn } from "../../../shared/lib/utils.js";

function toProofTypeLabel(proofType) {
  return proofType.charAt(0).toUpperCase() + proofType.slice(1);
}

function getProofStatusBadgeVariant(status) {
  if (status === proofStatuses.verified) {
    return "success";
  }

  if (status === proofStatuses.rejected) {
    return "neutral";
  }

  return "info";
}

function ProofReviewPage() {
  const { currentRole } = useAuth();
  const {
    proofs,
    getAllowedNextProofStatuses,
    updateProofStatus,
    isLoading,
    error,
  } = useProofs();
  const { getMissionById, isLoading: isMissionsLoading } = useMissions();
  const [activeProofAction, setActiveProofAction] = useState("");
  const [proofActionError, setProofActionError] = useState("");

  const sortedProofs = [...proofs].sort(
    (firstProof, secondProof) =>
      new Date(secondProof.updatedAt).getTime() -
      new Date(firstProof.updatedAt).getTime(),
  );

  const submittedProofs = sortedProofs.filter(
    (proof) => proof.status === proofStatuses.submitted,
  );

  const verifiedProofs = sortedProofs.filter(
    (proof) => proof.status === proofStatuses.verified,
  );

  const rejectedProofs = sortedProofs.filter(
    (proof) => proof.status === proofStatuses.rejected,
  );

  const proofsWithTransitions = sortedProofs.map((proof) => {
    const allowedProofTransitions = getAllowedNextProofStatuses(
      proof.status,
      currentRole,
    );

    const isActionableForReviewer =
      proof.status === proofStatuses.submitted &&
      allowedProofTransitions.length > 0;

    return {
      proof,
      allowedProofTransitions,
      isActionableForReviewer,
    };
  });

  const actionableProofs = proofsWithTransitions.filter(
    (proofEntry) => proofEntry.isActionableForReviewer,
  );

  const nonActionableProofs = proofsWithTransitions.filter(
    (proofEntry) => !proofEntry.isActionableForReviewer,
  );

  const orderedProofs = [...actionableProofs, ...nonActionableProofs];

  const handleProofStatusTransition = async (proofId, nextStatus) => {
    if (!currentRole) {
      return;
    }

    setActiveProofAction(`${proofId}:${nextStatus}`);
    setProofActionError("");

    const result = await updateProofStatus({
      proofId,
      nextStatus,
      actorRole: currentRole,
    });

    if (!result.ok) {
      setProofActionError(result.error ?? "Unable to update proof status.");
    }

    setActiveProofAction("");
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="neutral">Protected · Admin Role Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Proof Review Workflow
        </h1>
        <p className="text-sm text-slate-600">
          Review incoming mission evidence and monitor verification lifecycle
          across all submitted proofs.
        </p>
      </header>

      {(isLoading || isMissionsLoading) && proofs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loading proofs...</CardTitle>
            <CardDescription>
              Syncing review queue from backend.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Review</CardTitle>
            <CardDescription>Proofs waiting for verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {submittedProofs.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verified</CardTitle>
            <CardDescription>Proofs approved by reviewers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {verifiedProofs.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rejected</CardTitle>
            <CardDescription>Proofs requiring resubmission.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {rejectedProofs.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Queue</CardTitle>
          <CardDescription>
            Latest proof submissions ordered by update time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {proofActionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {proofActionError}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {sortedProofs.length === 0 ? (
            <p className="text-sm text-slate-600">
              No proof submissions available yet.
            </p>
          ) : (
            orderedProofs.map(({ proof, allowedProofTransitions }) => {
              const mission = getMissionById(proof.missionId);

              return (
                <article
                  key={proof.id}
                  className="rounded-md border border-slate-200 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{proof.id}</p>
                    <Badge variant={getProofStatusBadgeVariant(proof.status)}>
                      {proof.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="mt-2 text-slate-600">
                    <span className="font-medium text-slate-800">Mission:</span>{" "}
                    {mission
                      ? `${mission.id} · ${mission.title}`
                      : proof.missionId}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-800">
                      Proof Type:
                    </span>{" "}
                    {toProofTypeLabel(proof.proofType)}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-800">
                      Submitted By:
                    </span>{" "}
                    {proof.submittedBy}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-800">
                      Assignment:
                    </span>{" "}
                    {proof.assignmentId || "—"}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-800">Note:</span>{" "}
                    {proof.note || "—"}
                  </p>
                  <p className="mt-1 text-slate-500">
                    <span className="font-medium text-slate-700">
                      Submitted:
                    </span>{" "}
                    {formatDateTime(proof.submittedAt)}
                  </p>
                  <p className="mt-1 text-slate-500">
                    <span className="font-medium text-slate-700">Updated:</span>{" "}
                    {formatDateTime(proof.updatedAt)}
                  </p>

                  {allowedProofTransitions.length === 0 ? (
                    <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      No actions available for your role at this status.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {allowedProofTransitions.map((nextStatus) => (
                        <Button
                          key={`${proof.id}-${nextStatus}`}
                          size="sm"
                          variant="secondary"
                          disabled={activeProofAction.length > 0}
                          onClick={() =>
                            handleProofStatusTransition(proof.id, nextStatus)
                          }
                        >
                          {activeProofAction === `${proof.id}:${nextStatus}`
                            ? "Updating..."
                            : `Mark as ${nextStatus.toUpperCase()}`}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <Link
                      to={routePaths.missionDetail(proof.missionId)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Open Mission
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default ProofReviewPage;
