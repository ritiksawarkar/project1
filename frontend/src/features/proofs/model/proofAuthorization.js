import { authRoles, isValidAuthRole } from "../../auth/model/authRoles.js";
import { proofStatuses } from "./proofConstants.js";

const proofTransitionPolicy = {
  [proofStatuses.submitted]: {
    [proofStatuses.verified]: [authRoles.admin],
    [proofStatuses.rejected]: [authRoles.admin],
  },
  [proofStatuses.verified]: {},
  [proofStatuses.rejected]: {},
};

export function getAllowedNextProofStatuses(currentStatus, actorRole) {
  const statusTransitions = proofTransitionPolicy[currentStatus] ?? {};

  if (!isValidAuthRole(actorRole)) {
    return [];
  }

  return Object.entries(statusTransitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

export function canTransitionProofStatus(currentStatus, nextStatus, actorRole) {
  if (!isValidAuthRole(actorRole)) {
    return {
      ok: false,
      error: "Invalid user role for proof transition.",
    };
  }

  const allowedNextStatuses = getAllowedNextProofStatuses(
    currentStatus,
    actorRole,
  );

  if (!allowedNextStatuses.includes(nextStatus)) {
    return {
      ok: false,
      error: "You are not authorized to perform this proof transition.",
    };
  }

  return { ok: true };
}
