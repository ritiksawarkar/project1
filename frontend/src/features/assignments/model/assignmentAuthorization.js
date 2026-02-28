import { authRoles, isValidAuthRole } from "../../auth/model/authRoles.js";
import { assignmentStatuses } from "./assignmentConstants.js";

const assignmentTransitionPolicy = {
  [assignmentStatuses.assigned]: {
    [assignmentStatuses.inProgress]: [authRoles.volunteer, authRoles.admin],
    [assignmentStatuses.canceled]: [authRoles.admin],
  },
  [assignmentStatuses.inProgress]: {
    [assignmentStatuses.completed]: [authRoles.volunteer, authRoles.admin],
    [assignmentStatuses.canceled]: [authRoles.admin],
  },
  [assignmentStatuses.completed]: {},
  [assignmentStatuses.canceled]: {},
};

export function getAllowedNextAssignmentStatuses(currentStatus, actorRole) {
  const statusTransitions = assignmentTransitionPolicy[currentStatus] ?? {};

  if (!isValidAuthRole(actorRole)) {
    return [];
  }

  return Object.entries(statusTransitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

export function canTransitionAssignmentStatus(
  currentStatus,
  nextStatus,
  actorRole,
) {
  if (!isValidAuthRole(actorRole)) {
    return {
      ok: false,
      error: "Invalid user role for assignment transition.",
    };
  }

  const allowedNextStatuses = getAllowedNextAssignmentStatuses(
    currentStatus,
    actorRole,
  );

  if (!allowedNextStatuses.includes(nextStatus)) {
    return {
      ok: false,
      error: "You are not authorized to perform this assignment transition.",
    };
  }

  return { ok: true };
}
