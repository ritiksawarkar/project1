import Assignment, { assignmentStatuses } from "../models/Assignment.js";
import Mission from "../models/Mission.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { authRoles } from "../utils/authRoles.js";

const assignmentTransitionPolicy = {
  assigned: {
    inProgress: [authRoles.volunteer, authRoles.admin],
    canceled: [authRoles.admin],
  },
  inProgress: {
    completed: [authRoles.volunteer, authRoles.admin],
    canceled: [authRoles.admin],
  },
  completed: {},
  canceled: {},
};

function getAllowedAssignmentTransitions(currentStatus, actorRole) {
  const transitions = assignmentTransitionPolicy[currentStatus] || {};

  return Object.entries(transitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidStatus(status) {
  return assignmentStatuses.includes(status);
}

function isAdminRole(role) {
  return role === authRoles.admin;
}

async function ensureVolunteer(volunteerId) {
  const volunteer = await User.findById(volunteerId);

  if (!volunteer) {
    throw new AppError("Volunteer user not found.", 404);
  }

  if (!volunteer.isActive) {
    throw new AppError("Volunteer user is inactive.", 403);
  }

  if (
    volunteer.role !== authRoles.volunteer &&
    volunteer.role !== authRoles.admin
  ) {
    throw new AppError("Selected user cannot be assigned as volunteer.", 400);
  }

  return volunteer;
}

export async function createAssignment(payload, actor) {
  if (!isAdminRole(actor?.role)) {
    throw new AppError("Only admins can create assignments.", 403);
  }

  const missionId = sanitizeText(payload?.missionId);
  const volunteerId = sanitizeText(payload?.volunteerId);

  if (!missionId || !volunteerId) {
    throw new AppError("Mission and volunteer are required.", 400);
  }

  const mission = await Mission.findById(missionId);

  if (!mission) {
    throw new AppError("Mission not found.", 404);
  }

  await ensureVolunteer(volunteerId);

  const existingActiveAssignment = await Assignment.findOne({
    mission: mission._id,
    status: { $in: ["assigned", "inProgress"] },
  });

  if (existingActiveAssignment) {
    throw new AppError("Mission already has an active assignment.", 409);
  }

  const assignment = await Assignment.create({
    mission: mission._id,
    volunteer: volunteerId,
    assignedBy: actor.id,
    status: "assigned",
  });

  mission.status = "assigned";
  await mission.save();

  await assignment.populate([
    { path: "mission", select: "title status" },
    { path: "volunteer", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
  ]);

  return assignment.toSafeObject();
}

export async function listAssignableVolunteers() {
  const users = await User.find({
    isActive: true,
    role: { $in: [authRoles.volunteer, authRoles.admin] },
  }).sort({ name: 1 });

  return users.map((user) => user.toSafeObject());
}

export async function listAssignments(filters, actor) {
  const query = {};

  if (!isAdminRole(actor?.role)) {
    query.volunteer = actor.id;
  }

  if (filters.status) {
    if (!isValidStatus(filters.status)) {
      throw new AppError("Assignment status filter is invalid.", 400);
    }

    query.status = filters.status;
  }

  if (filters.missionId) {
    query.mission = sanitizeText(filters.missionId);
  }

  if (filters.volunteerId) {
    if (!isAdminRole(actor?.role) && sanitizeText(filters.volunteerId) !== actor.id) {
      throw new AppError("You are not authorized to access other volunteer assignments.", 403);
    }

    query.volunteer = sanitizeText(filters.volunteerId);
  }

  const assignments = await Assignment.find(query)
    .populate([
      { path: "mission", select: "title status" },
      { path: "volunteer", select: "name email role" },
      { path: "assignedBy", select: "name email role" },
    ])
    .sort({ updatedAt: -1 });

  return assignments.map((assignment) => assignment.toSafeObject());
}

export async function getAssignmentById(assignmentId) {
  const assignment = await Assignment.findById(assignmentId).populate([
    { path: "mission", select: "title status" },
    { path: "volunteer", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
  ]);

  if (!assignment) {
    throw new AppError("Assignment not found.", 404);
  }

  return assignment.toSafeObject();
}

export async function getAssignmentByIdForActor(assignmentId, actor) {
  const assignment = await Assignment.findById(assignmentId).populate([
    { path: "mission", select: "title status" },
    { path: "volunteer", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
  ]);

  if (!assignment) {
    throw new AppError("Assignment not found.", 404);
  }

  if (!isAdminRole(actor?.role)) {
    const assignmentVolunteerId =
      typeof assignment.volunteer === "object" && assignment.volunteer?._id
        ? assignment.volunteer._id.toString()
        : assignment.volunteer?.toString?.();

    if (assignmentVolunteerId !== actor.id) {
      throw new AppError("You are not authorized to access this assignment.", 403);
    }
  }

  return assignment.toSafeObject();
}

export async function updateAssignmentStatus(assignmentId, nextStatus, actor) {
  if (!isValidStatus(nextStatus)) {
    throw new AppError("Assignment status is invalid.", 400);
  }

  const assignment =
    await Assignment.findById(assignmentId).populate("mission");

  if (!assignment) {
    throw new AppError("Assignment not found.", 404);
  }

  const assignedVolunteerId =
    typeof assignment.volunteer === "object" && assignment.volunteer?._id
      ? assignment.volunteer._id.toString()
      : assignment.volunteer?.toString?.();

  if (!isAdminRole(actor?.role) && assignedVolunteerId !== actor.id) {
    throw new AppError("You are not authorized to update this assignment.", 403);
  }

  const allowedTransitions = getAllowedAssignmentTransitions(
    assignment.status,
    actor.role,
  );

  if (!allowedTransitions.includes(nextStatus)) {
    throw new AppError(
      "You are not authorized for this assignment transition.",
      403,
    );
  }

  assignment.status = nextStatus;
  await assignment.save();

  if (nextStatus === "completed" && assignment.mission.status === "assigned") {
    assignment.mission.status = "inTransit";
    await assignment.mission.save();
  }

  if (nextStatus === "canceled" && assignment.mission.status === "assigned") {
    assignment.mission.status = "created";
    await assignment.mission.save();
  }

  await assignment.populate([
    { path: "mission", select: "title status" },
    { path: "volunteer", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
  ]);

  return assignment.toSafeObject();
}

export function getAssignmentStatusMetadata(currentStatus, actorRole) {
  return {
    currentStatus,
    allowedNextStatuses: getAllowedAssignmentTransitions(
      currentStatus,
      actorRole,
    ),
  };
}

export async function deleteAssignment(assignmentId, actor) {
  if (!isAdminRole(actor?.role)) {
    throw new AppError("Only admins can delete assignments.", 403);
  }

  const assignment = await Assignment.findById(assignmentId).populate("mission");

  if (!assignment) {
    throw new AppError("Assignment not found.", 404);
  }

  const deletedAssignment = assignment.toSafeObject();
  const missionDocument = assignment.mission;

  await Assignment.deleteOne({ _id: assignment._id });

  if (missionDocument?._id) {
    const activeAssignments = await Assignment.countDocuments({
      mission: missionDocument._id,
      status: { $in: ["assigned", "inProgress"] },
    });

    if (activeAssignments === 0 && missionDocument.status === "assigned") {
      missionDocument.status = "created";
      await missionDocument.save();
    }
  }

  return deletedAssignment;
}
