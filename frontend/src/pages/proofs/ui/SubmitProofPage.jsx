import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAssignments } from "../../../features/assignments/model/useAssignments.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import { proofTypeOptions } from "../../../features/proofs/model/proofConstants.js";
import { useProofs } from "../../../features/proofs/model/useProofs.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { Button } from "../../../shared/ui/button/Button.jsx";
import { buttonVariants } from "../../../shared/ui/button/buttonVariants.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { Input } from "../../../shared/ui/input/Input.jsx";
import { cn } from "../../../shared/lib/utils.js";

const initialFormState = {
  proofType: proofTypeOptions[0],
  note: "",
};

function toProofTypeLabel(proofType) {
  return proofType.charAt(0).toUpperCase() + proofType.slice(1);
}

function validateProofForm(formData) {
  const errors = {};

  if (!proofTypeOptions.includes(formData.proofType)) {
    errors.proofType = "Select a valid proof type.";
  }

  if (formData.note.trim().length < 8) {
    errors.note = "Proof note must be at least 8 characters.";
  }

  return errors;
}

function SubmitProofPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const missionId = searchParams.get("missionId") ?? "";

  const { getMissionById, isLoading: isMissionsLoading } = useMissions();
  const { getAssignmentByMissionId, isLoading: isAssignmentsLoading } =
    useAssignments();
  const { submitProof, isLoading: isProofsLoading } = useProofs();
  const { currentUserName } = useAuth();

  const mission = missionId ? getMissionById(missionId) : null;
  const assignment = mission ? getAssignmentByMissionId(mission.id) : null;

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData((currentState) => ({
      ...currentState,
      [fieldName]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });

    if (submissionError) {
      setSubmissionError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mission) {
      setSubmissionError("Mission not found.");
      return;
    }

    const validationErrors = validateProofForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    const result = await submitProof({
      missionId: mission.id,
      assignmentId: assignment?.id ?? null,
      proofType: formData.proofType,
      note: formData.note,
    });

    if (!result.ok) {
      setIsSubmitting(false);
      setSubmissionError(result.error ?? "Unable to submit proof.");
      return;
    }

    navigate(routePaths.missionDetail(mission.id), { replace: true });
  };

  if (!mission) {
    if (isMissionsLoading || isAssignmentsLoading || isProofsLoading) {
      return (
        <section className="space-y-4">
          <Badge variant="neutral">Proof Submission</Badge>
          <Card>
            <CardHeader>
              <CardTitle>Loading mission context...</CardTitle>
              <CardDescription>
                Fetching mission and assignment linkage from backend.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <Badge variant="neutral">Proof Submission</Badge>
        <Card>
          <CardHeader>
            <CardTitle>Mission not found</CardTitle>
            <CardDescription>
              Cannot submit proof because the mission does not exist.
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
          Submit Donation Proof
        </h1>
        <p className="text-sm text-slate-600">
          Submit verifiable mission proof for tracking and downstream review.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mission {mission.id}</CardTitle>
          <CardDescription>{mission.title}</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="proof-type"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Proof Type
              </label>
              <select
                id="proof-type"
                value={formData.proofType}
                onChange={(event) =>
                  handleFieldChange("proofType", event.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                aria-invalid={Boolean(errors.proofType)}
              >
                {proofTypeOptions.map((proofType) => (
                  <option key={proofType} value={proofType}>
                    {toProofTypeLabel(proofType)}
                  </option>
                ))}
              </select>
              {errors.proofType ? (
                <p className="mt-1 text-xs text-red-600">{errors.proofType}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="proof-note"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Proof Note
              </label>
              <Input
                id="proof-note"
                value={formData.note}
                onChange={(event) =>
                  handleFieldChange("note", event.target.value)
                }
                placeholder="Describe handoff evidence and context"
                aria-invalid={Boolean(errors.note)}
              />
              {errors.note ? (
                <p className="mt-1 text-xs text-red-600">{errors.note}</p>
              ) : null}
            </div>

            <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 md:grid-cols-2">
              <p>
                <span className="font-medium text-slate-800">
                  Assignment ID:
                </span>{" "}
                {assignment?.id ?? "Unassigned"}
              </p>
              <p>
                <span className="font-medium text-slate-800">
                  Submitted by:
                </span>{" "}
                {currentUserName ?? "Authenticated user"}
              </p>
            </div>

            {submissionError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submissionError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Proof"}
              </Button>
              <Link
                to={routePaths.missionDetail(mission.id)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "md" }),
                )}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-xs text-slate-500">
            Proof submission creates an auditable timeline entry.
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}

export default SubmitProofPage;
