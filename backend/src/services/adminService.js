import Assignment from "../models/Assignment.js";
import Mission from "../models/Mission.js";
import Proof from "../models/Proof.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

function toBoolean(value) {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return null;
}

export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    totalMissions,
    openMissions,
    activeAssignments,
    pendingProofs,
    verifiedProofs,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    Mission.countDocuments({}),
    Mission.countDocuments({ status: { $ne: "closed" } }),
    Assignment.countDocuments({ status: { $in: ["assigned", "inProgress"] } }),
    Proof.countDocuments({ status: "submitted" }),
    Proof.countDocuments({ status: "verified" }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },
    missions: {
      total: totalMissions,
      open: openMissions,
      closed: totalMissions - openMissions,
    },
    assignments: {
      active: activeAssignments,
    },
    proofs: {
      pending: pendingProofs,
      verified: verifiedProofs,
    },
  };
}

export async function listUsers(filters) {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  const isActiveFilter = toBoolean(filters.isActive);

  if (isActiveFilter !== null) {
    query.isActive = isActiveFilter;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search.trim(), $options: "i" } },
      { email: { $regex: filters.search.trim(), $options: "i" } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 });

  return users.map((user) => user.toSafeObject());
}

export async function updateUserActiveState(userId, isActive) {
  if (typeof isActive !== "boolean") {
    throw new AppError("isActive must be a boolean.", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  user.isActive = isActive;
  await user.save();

  return user.toSafeObject();
}
