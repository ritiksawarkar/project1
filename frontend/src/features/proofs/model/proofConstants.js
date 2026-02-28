export const proofTypes = {
  pickup: "pickup",
  handoff: "handoff",
  delivery: "delivery",
};

export const proofStatuses = {
  submitted: "submitted",
  verified: "verified",
  rejected: "rejected",
};

export const proofTypeOptions = Object.values(proofTypes);
export const proofStatusOptions = Object.values(proofStatuses);

export function isValidProofType(proofType) {
  return proofTypeOptions.includes(proofType);
}

export function isValidProofStatus(status) {
  return proofStatusOptions.includes(status);
}
