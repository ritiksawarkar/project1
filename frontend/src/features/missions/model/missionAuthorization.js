import { isValidAuthRole, authRoles } from "../../auth/model/authRoles.js";
import { missionStatuses } from "./missionConstants.js";

const missionTransitionPolicy = {
  [missionStatuses.created]: {
    [missionStatuses.assigned]: [authRoles.volunteer, authRoles.admin],
  },
  [missionStatuses.assigned]: {
    [missionStatuses.inTransit]: [authRoles.volunteer, authRoles.admin],
  },
  [missionStatuses.inTransit]: {
    [missionStatuses.delivered]: [authRoles.volunteer, authRoles.admin],
  },
  [missionStatuses.delivered]: {
    [missionStatuses.closed]: [authRoles.recipientPartner, authRoles.admin],
  },
  [missionStatuses.closed]: {},
};

export function getAllowedNextStatuses(currentStatus, actorRole) {
  const statusTransitions = missionTransitionPolicy[currentStatus] ?? {};

  if (!isValidAuthRole(actorRole)) {
    return [];
  }

  return Object.entries(statusTransitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

export function canTransitionMissionStatus(
  currentStatus,
  nextStatus,
  actorRole,
) {
  if (!isValidAuthRole(actorRole)) {
    return {
      ok: false,
      error: "Invalid user role for mission transition.",
    };
  }

  const allowedNextStatuses = getAllowedNextStatuses(currentStatus, actorRole);

  if (!allowedNextStatuses.includes(nextStatus)) {
    return {
      ok: false,
      error: "You are not authorized to perform this status transition.",
    };
  }

  return { ok: true };
}
