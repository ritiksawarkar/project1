import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import {
  missionCategories,
  missionPriorities,
  missionPriorityOptions,
} from "../../../features/missions/model/missionConstants.js";
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

const areaOptions = [
  "Pimpri Zone",
  "Akurdi Zone",
  "Chinchwad Zone",
  "Nigdi Zone",
  "Ravet Zone",
];

const initialFormState = {
  title: "",
  donor: "",
  category: missionCategories[0],
  area: areaOptions[0],
  priority: missionPriorities.medium,
};

function getPriorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function validateMissionForm(formData) {
  const errors = {};

  if (formData.title.trim().length < 5) {
    errors.title = "Mission title must be at least 5 characters.";
  }

  if (formData.donor.trim().length < 3) {
    errors.donor = "Donor name must be at least 3 characters.";
  }

  if (!missionCategories.includes(formData.category)) {
    errors.category = "Select a valid donation category.";
  }

  if (!areaOptions.includes(formData.area)) {
    errors.area = "Select a valid mission area.";
  }

  if (!missionPriorityOptions.includes(formData.priority)) {
    errors.priority = "Select a valid mission priority.";
  }

  return errors;
}

function CreateMissionPage() {
  const navigate = useNavigate();
  const { createMission } = useMissions();
  const { currentUserName } = useAuth();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName, fieldValue) => {
    setFormData((currentState) => ({
      ...currentState,
      [fieldName]: fieldValue,
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

    const validationErrors = validateMissionForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    const result = await createMission(formData);

    if (!result.ok) {
      setIsSubmitting(false);
      setSubmissionError(result.error ?? "Unable to create mission right now.");
      return;
    }

    navigate(routePaths.missionDetail(result.mission.id), { replace: true });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="success">Protected · Auth Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create Mission
        </h1>
        <p className="text-sm text-slate-600">
          Register a new donation mission with complete operational metadata for
          assignment and tracking.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mission Intake Form</CardTitle>
          <CardDescription>
            All fields are required to create a mission.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="mission-title"
              >
                Mission Title
              </label>
              <Input
                id="mission-title"
                value={formData.title}
                onChange={(event) =>
                  handleFieldChange("title", event.target.value)
                }
                placeholder="e.g. Weekly dry ration distribution"
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="mission-donor"
              >
                Donor Name
              </label>
              <Input
                id="mission-donor"
                value={formData.donor}
                onChange={(event) =>
                  handleFieldChange("donor", event.target.value)
                }
                placeholder="e.g. Green Basket Mart"
                aria-invalid={Boolean(errors.donor)}
              />
              {errors.donor ? (
                <p className="mt-1 text-xs text-red-600">{errors.donor}</p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="mission-category"
              >
                Category
              </label>
              <select
                id="mission-category"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                value={formData.category}
                onChange={(event) =>
                  handleFieldChange("category", event.target.value)
                }
                aria-invalid={Boolean(errors.category)}
              >
                {missionCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="mission-area"
              >
                Area
              </label>
              <select
                id="mission-area"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                value={formData.area}
                onChange={(event) =>
                  handleFieldChange("area", event.target.value)
                }
                aria-invalid={Boolean(errors.area)}
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.area ? (
                <p className="mt-1 text-xs text-red-600">{errors.area}</p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="mission-priority"
              >
                Priority
              </label>
              <select
                id="mission-priority"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                value={formData.priority}
                onChange={(event) =>
                  handleFieldChange("priority", event.target.value)
                }
                aria-invalid={Boolean(errors.priority)}
              >
                {missionPriorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </option>
                ))}
              </select>
              {errors.priority ? (
                <p className="mt-1 text-xs text-red-600">{errors.priority}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              {submissionError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submissionError}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating Mission..." : "Create Mission"}
              </Button>
              <Link
                to={routePaths.missions}
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
            Created by: {currentUserName ?? "Authenticated user"}
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}

export default CreateMissionPage;
