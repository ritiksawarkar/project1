import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  assignmentStatuses,
  isValidAssignmentStatus,
} from "./assignmentConstants.js";
import {
  canTransitionAssignmentStatus,
  getAllowedNextAssignmentStatuses,
} from "./assignmentAuthorization.js";
import { apiRequest } from "../../../shared/api/httpClient.js";
import { useAuth } from "../../auth/model/useAuth.js";

const AssignmentContext = createContext(null);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function extractEntityId(entityValue) {
  if (!entityValue) {
    return "";
  }

  if (typeof entityValue === "string") {
    return entityValue;
  }

  if (typeof entityValue === "object" && typeof entityValue.id === "string") {
    return entityValue.id;
  }

  return "";
}

function normalizeVolunteer(rawVolunteer) {
  if (!rawVolunteer || typeof rawVolunteer !== "object") {
    return null;
  }

  if (typeof rawVolunteer.id !== "string" || typeof rawVolunteer.name !== "string") {
    return null;
  }

  return {
    id: rawVolunteer.id,
    name: rawVolunteer.name,
    email: typeof rawVolunteer.email === "string" ? rawVolunteer.email : "",
    role: typeof rawVolunteer.role === "string" ? rawVolunteer.role : "volunteer",
    isActive: rawVolunteer.isActive !== false,
  };
}

function normalizeAssignment(rawAssignment) {
  if (!rawAssignment || typeof rawAssignment !== "object") {
    return null;
  }

  const missionId = extractEntityId(rawAssignment.mission);
  const volunteerId = extractEntityId(rawAssignment.volunteer);

  if (
    typeof rawAssignment.id !== "string" ||
    !missionId ||
    !volunteerId ||
    typeof rawAssignment.status !== "string"
  ) {
    return null;
  }

  return {
    id: rawAssignment.id,
    missionId,
    mission:
      typeof rawAssignment.mission === "object" ? rawAssignment.mission : null,
    volunteerId,
    volunteer:
      typeof rawAssignment.volunteer === "object"
        ? rawAssignment.volunteer
        : null,
    assignedBy:
      typeof rawAssignment.assignedBy === "object"
        ? rawAssignment.assignedBy
        : null,
    status: rawAssignment.status,
    assignedAt: rawAssignment.createdAt,
    updatedAt: rawAssignment.updatedAt,
  };
}

function AssignmentProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAssignments = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setVolunteers([]);
      setAssignments([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [assignmentResponse, volunteerResponse] = await Promise.all([
        apiRequest("/assignments", {
          method: "GET",
          token: accessToken,
        }),
        apiRequest("/assignments/volunteers", {
          method: "GET",
          token: accessToken,
        }),
      ]);

      const nextAssignments = Array.isArray(assignmentResponse.data)
        ? assignmentResponse.data
            .map((assignment) => normalizeAssignment(assignment))
            .filter(Boolean)
        : [];

      const nextVolunteers = Array.isArray(volunteerResponse.data)
        ? volunteerResponse.data
            .map((volunteer) => normalizeVolunteer(volunteer))
            .filter(Boolean)
        : [];

      setAssignments(nextAssignments);
      setVolunteers(nextVolunteers);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  const getVolunteerById = useCallback(
    (volunteerId) =>
      volunteers.find((volunteer) => volunteer.id === volunteerId) ?? null,
    [volunteers],
  );

  const getAssignmentByMissionId = useCallback(
    (missionId) =>
      assignments.find(
        (assignment) =>
          assignment.missionId === missionId &&
          assignment.status !== assignmentStatuses.canceled,
      ) ?? null,
    [assignments],
  );

  const getAvailableVolunteersByArea = useCallback(
    () => {
      const activeVolunteerIds = new Set(
        assignments
          .filter(
            (assignment) =>
              assignment.status === assignmentStatuses.assigned ||
              assignment.status === assignmentStatuses.inProgress,
          )
          .map((assignment) => assignment.volunteerId),
      );

      return volunteers.filter((volunteer) => !activeVolunteerIds.has(volunteer.id));
    },
    [assignments, volunteers],
  );

  const assignVolunteerToMission = useCallback(
    async ({ missionId, volunteerId }) => {
      const normalizedMissionId = normalizeText(missionId);
      const normalizedVolunteerId = normalizeText(volunteerId);

      if (!normalizedMissionId || !normalizedVolunteerId) {
        return { ok: false, error: "Mission and volunteer are required." };
      }

      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      try {
        const response = await apiRequest("/assignments", {
          method: "POST",
          token: accessToken,
          body: {
            missionId: normalizedMissionId,
            volunteerId: normalizedVolunteerId,
          },
        });

        const nextAssignment = normalizeAssignment(response.data);

        if (!nextAssignment) {
          return { ok: false, error: "Invalid assignment response payload." };
        }

        setAssignments((currentAssignments) => [nextAssignment, ...currentAssignments]);
        return { ok: true, assignment: nextAssignment };
      } catch (requestError) {
        return {
          ok: false,
          error: requestError?.message || "Unable to assign volunteer.",
        };
      }
    },
    [accessToken],
  );

  const updateAssignmentStatus = useCallback(
    async (assignmentId, nextStatus, actorRole) => {
      const normalizedAssignmentId = normalizeText(assignmentId);

      if (!normalizedAssignmentId || !isValidAssignmentStatus(nextStatus)) {
        return {
          ok: false,
          error: "Invalid assignment status update request.",
        };
      }

      if (!accessToken) {
        return { ok: false, error: "Authentication is required." };
      }

      const targetAssignment = assignments.find(
        (assignment) => assignment.id === normalizedAssignmentId,
      );

      if (!targetAssignment) {
        return { ok: false, error: "Assignment not found." };
      }

      const authorizationResult = canTransitionAssignmentStatus(
        targetAssignment.status,
        nextStatus,
        actorRole,
      );

      if (!authorizationResult.ok) {
        return { ok: false, error: authorizationResult.error };
      }

      try {
        const response = await apiRequest(
          `/assignments/${normalizedAssignmentId}/status`,
          {
            method: "PATCH",
            token: accessToken,
            body: { nextStatus },
          },
        );

        const updatedAssignment = normalizeAssignment(response.data);

        if (!updatedAssignment) {
          return { ok: false, error: "Invalid assignment response payload." };
        }

        setAssignments((currentAssignments) =>
          currentAssignments.map((assignment) =>
            assignment.id === normalizedAssignmentId
              ? updatedAssignment
              : assignment,
          ),
        );

        return { ok: true, assignment: updatedAssignment };
      } catch (requestError) {
        return {
          ok: false,
          error:
            requestError?.message || "Unable to update assignment status.",
        };
      }
    },
    [accessToken, assignments],
  );

  const value = useMemo(
    () => ({
      volunteers,
      assignments,
      isLoading,
      error,
      refreshAssignments,
      getVolunteerById,
      getAssignmentByMissionId,
      getAvailableVolunteersByArea,
      getAllowedNextAssignmentStatuses,
      assignVolunteerToMission,
      updateAssignmentStatus,
    }),
    [
      assignments,
      assignVolunteerToMission,
      getAssignmentByMissionId,
      getAvailableVolunteersByArea,
      getVolunteerById,
      updateAssignmentStatus,
      volunteers,
      error,
      isLoading,
      refreshAssignments,
    ],
  );

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}

export { AssignmentContext, AssignmentProvider };
