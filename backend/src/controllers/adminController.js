import {
  getAdminOverview,
  listUsers,
  updateUserActiveState,
} from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAdminOverviewHandler = asyncHandler(async (_req, res) => {
  const data = await getAdminOverview();

  res.status(200).json({
    success: true,
    message: "Admin overview fetched successfully.",
    data,
  });
});

export const listUsersHandler = asyncHandler(async (req, res) => {
  const data = await listUsers(req.query);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully.",
    data,
  });
});

export const updateUserActiveStateHandler = asyncHandler(async (req, res) => {
  const data = await updateUserActiveState(req.params.id, req.body.isActive);

  res.status(200).json({
    success: true,
    message: "User status updated successfully.",
    data,
  });
});
