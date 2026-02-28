import {
  createMission,
  deleteMission,
  getMissionById,
  getMissionStatusMetadata,
  listMissions,
  updateMissionStatus,
} from "../services/missionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMissionHandler = asyncHandler(async (req, res) => {
  const data = await createMission(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Mission created successfully.",
    data,
  });
});

export const listMissionsHandler = asyncHandler(async (req, res) => {
  const data = await listMissions(req.query);

  res.status(200).json({
    success: true,
    message: "Missions fetched successfully.",
    data,
  });
});

export const getMissionByIdHandler = asyncHandler(async (req, res) => {
  const data = await getMissionById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Mission fetched successfully.",
    data,
  });
});

export const updateMissionStatusHandler = asyncHandler(async (req, res) => {
  const data = await updateMissionStatus(
    req.params.id,
    req.body.nextStatus,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: "Mission status updated successfully.",
    data,
  });
});

export const missionStatusMetadataHandler = asyncHandler(async (req, res) => {
  const data = getMissionStatusMetadata(req.params.status, req.user.role);

  res.status(200).json({
    success: true,
    message: "Mission status metadata fetched successfully.",
    data,
  });
});

export const deleteMissionHandler = asyncHandler(async (req, res) => {
  const data = await deleteMission(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Mission deleted successfully.",
    data,
  });
});
