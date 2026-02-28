import { isValidAuthRole } from "../model/authRoles.js";

export function normalizeAllowedRoles(allowedRoles) {
  if (!Array.isArray(allowedRoles)) {
    return [];
  }

  return allowedRoles.filter((role) => isValidAuthRole(role));
}

export function hasAnyAllowedRole(userRole, allowedRoles) {
  const normalizedAllowedRoles = normalizeAllowedRoles(allowedRoles);

  if (!isValidAuthRole(userRole) || normalizedAllowedRoles.length === 0) {
    return false;
  }

  return normalizedAllowedRoles.includes(userRole);
}
