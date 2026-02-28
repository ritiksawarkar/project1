import Mission, {
  missionPriorities,
  missionStatuses,
} from "../models/Mission.js";
import Assignment from "../models/Assignment.js";
import Proof from "../models/Proof.js";
import { AppError } from "../utils/AppError.js";
import { authRoles } from "../utils/authRoles.js";

const missionTransitionPolicy = {
  created: {
    assigned: [authRoles.volunteer, authRoles.admin],
  },
  assigned: {
    inTransit: [authRoles.volunteer, authRoles.admin],
  },
  inTransit: {
    delivered: [authRoles.volunteer, authRoles.admin],
  },
  delivered: {
    closed: [authRoles.recipientPartner, authRoles.admin],
  },
  closed: {},
};

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePriority(priority) {
  return missionPriorities.includes(priority);
}

function validateStatus(status) {
  return missionStatuses.includes(status);
}

function getAllowedMissionTransitions(currentStatus, actorRole) {
  const transitions = missionTransitionPolicy[currentStatus] || {};

  return Object.entries(transitions)
    .filter(([, allowedRoles]) => allowedRoles.includes(actorRole))
    .map(([nextStatus]) => nextStatus);
}

export async function createMission(payload, actor) {
  const title = sanitizeText(payload?.title);
  const donor = sanitizeText(payload?.donor);
  const category = sanitizeText(payload?.category);
  const area = sanitizeText(payload?.area);
  const priority = sanitizeText(payload?.priority) || "medium";

  if (title.length < 5) {
    throw new AppError("Mission title must be at least 5 characters.", 400);
  }

  if (donor.length < 2 || !category || !area) {
    throw new AppError("Donor, category, and area are required.", 400);
  }

  if (!validatePriority(priority)) {
    throw new AppError("Mission priority is invalid.", 400);
  }

  const mission = await Mission.create({
    title,
    donor,
    category,
    area,
    priority,
    createdBy: actor.id,
  });

  await mission.populate("createdBy", "name email role");

  return mission.toSafeObject();
}

export async function listMissions(filters) {
  const query = {};

  if (filters.status) {
    if (!validateStatus(filters.status)) {
      throw new AppError("Mission status filter is invalid.", 400);
    }

    query.status = filters.status;
  }

  if (filters.priority) {
    if (!validatePriority(filters.priority)) {
      throw new AppError("Mission priority filter is invalid.", 400);
    }

    query.priority = filters.priority;
  }

  if (filters.area) {
    query.area = { $regex: sanitizeText(filters.area), $options: "i" };
  }

  if (filters.category) {
    query.category = { $regex: sanitizeText(filters.category), $options: "i" };
  }

  const missions = await Mission.find(query)
    .populate("createdBy", "name email role")
    .sort({ updatedAt: -1 });

  return missions.map((mission) => mission.toSafeObject());
}

export async function getMissionById(missionId) {
  const mission = await Mission.findById(missionId).populate(
    "createdBy",
    "name email role",
  );

  if (!mission) {
    throw new AppError("Mission not found.", 404);
  }

  return mission.toSafeObject();
}

export async function updateMissionStatus(missionId, nextStatus, actor) {
  if (!validateStatus(nextStatus)) {
    throw new AppError("Mission status is invalid.", 400);
  }

  const mission = await Mission.findById(missionId);

  if (!mission) {
    throw new AppError("Mission not found.", 404);
  }

  const allowedTransitions = getAllowedMissionTransitions(
    mission.status,
    actor.role,
  );

  if (!allowedTransitions.includes(nextStatus)) {
    throw new AppError(
      "You are not authorized for this mission transition.",
      403,
    );
  }

  mission.status = nextStatus;
  await mission.save();
  await mission.populate("createdBy", "name email role");

  return mission.toSafeObject();
}

export function getMissionStatusMetadata(currentStatus, actorRole) {
  return {
    currentStatus,
    allowedNextStatuses: getAllowedMissionTransitions(currentStatus, actorRole),
  };
}

export async function deleteMission(missionId, actor) {
  if (actor?.role !== authRoles.admin) {
    throw new AppError("Only admins can delete missions.", 403);
  }

  const mission = await Mission.findById(missionId).populate(
    "createdBy",
    "name email role",
  );

  if (!mission) {
    throw new AppError("Mission not found.", 404);
  }

  await Promise.all([
    Assignment.deleteMany({ mission: mission._id }),
    Proof.deleteMany({ mission: mission._id }),
    Mission.deleteOne({ _id: mission._id }),
  ]);

  return mission.toSafeObject();
}
