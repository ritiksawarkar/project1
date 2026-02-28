import Assignment from "../models/Assignment.js";
import Mission from "../models/Mission.js";
import Proof, { proofStatuses, proofTypes } from "../models/Proof.js";
import { AppError } from "../utils/AppError.js";
import { authRoles } from "../utils/authRoles.js";

const proofTransitionPolicy = {
  submitted: {
    verified: [authRoles.admin],
    rejected: [authRoles.admin],
  },
  verified: {},
  rejected: {},
};

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidProofType(proofType) {
  return proofTypes.includes(proofType);
}

function isValidProofStatus(status) {
  return proofStatuses.includes(status);
}

function getAllowedProofTransitions(currentStatus, actorRole) {
  const transitions = proofTransitionPolicy[currentStatus] || {};

  return Object.entries(transitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

function isAdminRole(role) {
  return role === authRoles.admin;
}

export async function createProof(payload, actor) {
  const missionId = sanitizeText(payload?.missionId);
  const assignmentId = sanitizeText(payload?.assignmentId);
  const proofType = sanitizeText(payload?.proofType);
  const note = sanitizeText(payload?.note);

  if (!missionId || !proofType) {
    throw new AppError("Mission and proof type are required.", 400);
  }

  if (!isValidProofType(proofType)) {
    throw new AppError("Proof type is invalid.", 400);
  }

  const mission = await Mission.findById(missionId);

  if (!mission) {
    throw new AppError("Mission not found.", 404);
  }

  let assignment = null;

  if (assignmentId) {
    assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (assignment.mission.toString() !== mission._id.toString()) {
      throw new AppError(
        "Assignment does not belong to the provided mission.",
        400,
      );
    }

    if (!isAdminRole(actor?.role) && assignment.volunteer.toString() !== actor.id) {
      throw new AppError(
        "You are not authorized to submit proof for this assignment.",
        403,
      );
    }
  }

  const proof = await Proof.create({
    mission: mission._id,
    assignment: assignment?._id || null,
    proofType,
    note,
    submittedBy: actor.id,
  });

  await proof.populate([
    { path: "mission", select: "title status" },
    { path: "assignment", select: "status" },
    { path: "submittedBy", select: "name email role" },
    { path: "verifiedBy", select: "name email role" },
  ]);

  return proof.toSafeObject();
}

export async function listProofs(filters, actor) {
  const query = {};

  if (!isAdminRole(actor?.role)) {
    query.submittedBy = actor.id;
  }

  if (filters.missionId) {
    query.mission = sanitizeText(filters.missionId);
  }

  if (filters.assignmentId) {
    query.assignment = sanitizeText(filters.assignmentId);
  }

  if (filters.status) {
    if (!isValidProofStatus(filters.status)) {
      throw new AppError("Proof status filter is invalid.", 400);
    }

    query.status = filters.status;
  }

  const proofs = await Proof.find(query)
    .populate([
      { path: "mission", select: "title status" },
      { path: "assignment", select: "status" },
      { path: "submittedBy", select: "name email role" },
      { path: "verifiedBy", select: "name email role" },
    ])
    .sort({ updatedAt: -1 });

  return proofs.map((proof) => proof.toSafeObject());
}

export async function getProofById(proofId) {
  const proof = await Proof.findById(proofId).populate([
    { path: "mission", select: "title status" },
    { path: "assignment", select: "status" },
    { path: "submittedBy", select: "name email role" },
    { path: "verifiedBy", select: "name email role" },
  ]);

  if (!proof) {
    throw new AppError("Proof not found.", 404);
  }

  return proof.toSafeObject();
}

export async function getProofByIdForActor(proofId, actor) {
  const proof = await Proof.findById(proofId).populate([
    { path: "mission", select: "title status" },
    { path: "assignment", select: "status" },
    { path: "submittedBy", select: "name email role" },
    { path: "verifiedBy", select: "name email role" },
  ]);

  if (!proof) {
    throw new AppError("Proof not found.", 404);
  }

  if (!isAdminRole(actor?.role)) {
    const proofSubmitterId =
      typeof proof.submittedBy === "object" && proof.submittedBy?._id
        ? proof.submittedBy._id.toString()
        : proof.submittedBy?.toString?.();

    if (proofSubmitterId !== actor.id) {
      throw new AppError("You are not authorized to access this proof.", 403);
    }
  }

  return proof.toSafeObject();
}

export async function updateProofStatus(proofId, nextStatus, actor) {
  if (!isValidProofStatus(nextStatus)) {
    throw new AppError("Proof status is invalid.", 400);
  }

  const proof = await Proof.findById(proofId);

  if (!proof) {
    throw new AppError("Proof not found.", 404);
  }

  const allowedTransitions = getAllowedProofTransitions(
    proof.status,
    actor.role,
  );

  if (!allowedTransitions.includes(nextStatus)) {
    throw new AppError(
      "You are not authorized for this proof transition.",
      403,
    );
  }

  proof.status = nextStatus;
  proof.verifiedBy = actor.id;
  await proof.save();

  await proof.populate([
    { path: "mission", select: "title status" },
    { path: "assignment", select: "status" },
    { path: "submittedBy", select: "name email role" },
    { path: "verifiedBy", select: "name email role" },
  ]);

  return proof.toSafeObject();
}

export function getProofStatusMetadata(currentStatus, actorRole) {
  return {
    currentStatus,
    allowedNextStatuses: getAllowedProofTransitions(currentStatus, actorRole),
  };
}

export async function deleteProof(proofId, actor) {
  const proof = await Proof.findById(proofId);

  if (!proof) {
    throw new AppError("Proof not found.", 404);
  }

  const isAdmin = isAdminRole(actor?.role);
  const isSubmitter = proof.submittedBy?.toString?.() === actor?.id;

  if (!isAdmin && !isSubmitter) {
    throw new AppError("You are not authorized to delete this proof.", 403);
  }

  if (!isAdmin && proof.status !== "submitted") {
    throw new AppError(
      "Only submitted proofs can be deleted by the submitter.",
      409,
    );
  }

  const deletedProof = proof.toSafeObject();
  await Proof.deleteOne({ _id: proof._id });

  return deletedProof;
}
