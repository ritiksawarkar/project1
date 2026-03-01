import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { useAssignments } from "../../../features/assignments/model/useAssignments.js";
import { useProofs } from "../../../features/proofs/model/useProofs.js";
import { proofStatuses } from "../../../features/proofs/model/proofConstants.js";
import {
  formatDateTime,
  formatMissionStatus,
  getPriorityBadgeVariant,
} from "../../../features/missions/lib/missionPresentation.js";
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

function getProofStatusBadgeVariant(status) {
  if (status === proofStatuses.verified) {
    return "success";
  }

  if (status === proofStatuses.rejected) {
    return "neutral";
  }

  return "info";
}

function formatProofType(proofType) {
  return proofType.charAt(0).toUpperCase() + proofType.slice(1);
}

function MissionDetailPage() {
  const { id } = useParams();
  const {
    getMissionById,
    getAllowedNextStatuses,
    updateMissionStatus,
    isLoading: isMissionsLoading,
    error: missionsError,
  } = useMissions();
  const {
    getAssignmentByMissionId,
    getVolunteerById,
    getAllowedNextAssignmentStatuses,
    updateAssignmentStatus,
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
  } = useAssignments();
  const {
    getProofsByMissionId,
    getLatestProofByMissionId,
    isLoading: isProofsLoading,
    error: proofsError,
  } = useProofs();
  const { currentRole } = useAuth();
  const [actionError, setActionError] = useState("");
  const [activeStatusUpdate, setActiveStatusUpdate] = useState("");
  const [assignmentActionError, setAssignmentActionError] = useState("");
  const [activeAssignmentStatusUpdate, setActiveAssignmentStatusUpdate] =
    useState("");

  const mission = id ? getMissionById(id) : null;
  const assignment = mission ? getAssignmentByMissionId(mission.id) : null;
  const assignedVolunteer = assignment
    ? (assignment.volunteer ?? getVolunteerById(assignment.volunteerId))
    : null;
  const allowedAssignmentTransitions = assignment
    ? getAllowedNextAssignmentStatuses(assignment.status, currentRole)
    : [];
  const availableTransitions = mission
    ? getAllowedNextStatuses(mission.status, currentRole)
    : [];
  const missionProofs = mission ? getProofsByMissionId(mission.id) : [];
  const latestProof = mission ? getLatestProofByMissionId(mission.id) : null;

  const handleStatusTransition = async (nextStatus) => {
    if (!mission || !currentRole) {
      return;
    }

    setActiveStatusUpdate(nextStatus);
    setActionError("");

    const result = await updateMissionStatus(
      mission.id,
      nextStatus,
      currentRole,
    );

    if (!result.ok) {
      setActionError(result.error ?? "Unable to update mission status.");
    }

    setActiveStatusUpdate("");
  };

  const handleAssignmentStatusTransition = async (nextStatus) => {
    if (!assignment || !currentRole) {
      return;
    }

    setActiveAssignmentStatusUpdate(nextStatus);
    setAssignmentActionError("");

    const result = await updateAssignmentStatus(
      assignment.id,
      nextStatus,
      currentRole,
    );

    if (!result.ok) {
      setAssignmentActionError(
        result.error ?? "Unable to update assignment status.",
      );
    }

    setActiveAssignmentStatusUpdate("");
  };

  if (
    (isMissionsLoading || isAssignmentsLoading || isProofsLoading) &&
    !mission
  ) {
    return (
      <section className="space-y-4">
        <Badge variant="neutral">Mission Detail</Badge>
        <Card>
          <CardHeader>
            <CardTitle>Loading mission details...</CardTitle>
            <CardDescription>
              Syncing mission, assignment, and proof records from backend.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  if (!mission) {
    return (
      <section className="space-y-4">
        <Badge variant="neutral">Mission Detail</Badge>
        <Card>
          <CardHeader>
            <CardTitle>Mission not found</CardTitle>
            <CardDescription>
              The requested mission may have been removed or the ID is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={routePaths.missions}
              className={cn(buttonVariants({ variant: "outline", size: "md" }))}
            >
              Back to Missions
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="success">Protected · Auth Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Mission {mission.id}
        </h1>
        <p className="text-sm text-slate-600">
          Detailed mission lifecycle, ownership, and operational metadata.
        </p>
        {missionsError || assignmentsError || proofsError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {[missionsError, assignmentsError, proofsError]
              .filter(Boolean)
              .join(" | ")}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span>Mission Overview</span>
              <Badge variant={getPriorityBadgeVariant(mission.priority)}>
                {mission.priority.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>{mission.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Status:</span>{" "}
              {formatMissionStatus(mission.status)}
            </p>
            <p>
              <span className="font-medium text-slate-800">Category:</span>{" "}
              {mission.category}
            </p>
            <p>
              <span className="font-medium text-slate-800">Area:</span>{" "}
              {mission.area}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ownership and Timeline</CardTitle>
            <CardDescription>
              Traceability details for audit and operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Donor:</span>{" "}
              {mission.donor}
            </p>
            <p>
              <span className="font-medium text-slate-800">Created By:</span>{" "}
              {mission.createdBy}
            </p>
            <p>
              <span className="font-medium text-slate-800">Created At:</span>{" "}
              {formatDateTime(mission.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-800">Last Updated:</span>{" "}
              {formatDateTime(mission.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Metadata</CardTitle>
          <CardDescription>
            Volunteer assignment details linked to this mission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          {assignment ? (
            <>
              <p>
                <span className="font-medium text-slate-800">
                  Assignment ID:
                </span>{" "}
                {assignment.id}
              </p>
              <p>
                <span className="font-medium text-slate-800">Volunteer:</span>{" "}
                {assignedVolunteer
                  ? assignedVolunteer.name
                  : "Unknown volunteer"}
              </p>
              <p>
                <span className="font-medium text-slate-800">
                  Assignment Status:
                </span>{" "}
                {formatMissionStatus(assignment.status)}
              </p>
              <p>
                <span className="font-medium text-slate-800">Assigned By:</span>{" "}
                {assignment.assignedBy?.name ?? "System"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Assigned At:</span>{" "}
                {formatDateTime(assignment.assignedAt)}
              </p>
              <p>
                <span className="font-medium text-slate-800">
                  Last Updated:
                </span>{" "}
                {formatDateTime(assignment.updatedAt)}
              </p>

              <div className="pt-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Guarded Assignment Actions
                </p>

                {allowedAssignmentTransitions.length === 0 ? (
                  <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    No assignment transition is available for your current role.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allowedAssignmentTransitions.map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="secondary"
                        disabled={activeAssignmentStatusUpdate.length > 0}
                        onClick={() =>
                          handleAssignmentStatusTransition(nextStatus)
                        }
                      >
                        {activeAssignmentStatusUpdate === nextStatus
                          ? "Updating..."
                          : `Mark as ${formatMissionStatus(nextStatus)}`}
                      </Button>
                    ))}
                  </div>
                )}

                {assignmentActionError ? (
                  <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {assignmentActionError}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              This mission has no active volunteer assignment yet.
            </p>
          )}
        </CardContent>
        <CardContent className="pt-0">
          <Link
            to={routePaths.proofSubmitForMission(mission.id)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Submit Proof
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proof Evidence</CardTitle>
          <CardDescription>
            Latest verification state and submission history for this mission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {latestProof ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  Latest Proof: {latestProof.id}
                </p>
                <Badge variant={getProofStatusBadgeVariant(latestProof.status)}>
                  {latestProof.status.toUpperCase()}
                </Badge>
              </div>
              <p className="mt-2">
                <span className="font-medium text-slate-800">Type:</span>{" "}
                {formatProofType(latestProof.proofType)}
              </p>
              <p>
                <span className="font-medium text-slate-800">
                  Submitted By:
                </span>{" "}
                {latestProof.submittedBy}
              </p>
              <p>
                <span className="font-medium text-slate-800">
                  Submitted At:
                </span>{" "}
                {formatDateTime(latestProof.submittedAt)}
              </p>
              <p>
                <span className="font-medium text-slate-800">Verified By:</span>{" "}
                {latestProof.verifiedBy ?? "Pending review"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Note:</span>{" "}
                {latestProof.note || "—"}
              </p>
            </div>
          ) : (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              No proof has been submitted for this mission yet.
            </p>
          )}

          {missionProofs.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Submission Timeline ({missionProofs.length})
              </p>
              <div className="space-y-2">
                {missionProofs.map((proof) => (
                  <article
                    key={proof.id}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{proof.id}</p>
                      <Badge variant={getProofStatusBadgeVariant(proof.status)}>
                        {proof.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-2">
                      <span className="font-medium text-slate-800">Type:</span>{" "}
                      {formatProofType(proof.proofType)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Submitted:
                      </span>{" "}
                      {formatDateTime(proof.submittedAt)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Updated:
                      </span>{" "}
                      {formatDateTime(proof.updatedAt)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guarded Mission Actions</CardTitle>
          <CardDescription>
            Available actions are based on your current role and mission status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Current role:{" "}
            <span className="font-medium text-slate-800">
              {currentRole ?? "Unknown"}
            </span>
          </p>

          {availableTransitions.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No status transition is available for your role at this stage.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {availableTransitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  variant="secondary"
                  size="sm"
                  disabled={activeStatusUpdate.length > 0}
                  onClick={() => handleStatusTransition(nextStatus)}
                >
                  {activeStatusUpdate === nextStatus
                    ? "Updating..."
                    : `Mark as ${formatMissionStatus(nextStatus)}`}
                </Button>
              ))}
            </div>
          )}

          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Link
        to={routePaths.missions}
        className={cn(buttonVariants({ variant: "outline", size: "md" }))}
      >
        Back to Missions
      </Link>
    </section>
  );
}

export default MissionDetailPage;
