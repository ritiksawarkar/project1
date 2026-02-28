import {
  createAssignment,
  deleteAssignment,
  getAssignmentByIdForActor,
  getAssignmentStatusMetadata,
  listAssignableVolunteers,
  listAssignments,
  updateAssignmentStatus,
} from "../services/assignmentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAssignmentHandler = asyncHandler(async (req, res) => {
  const data = await createAssignment(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Assignment created successfully.",
    data,
  });
});

export const listAssignmentsHandler = asyncHandler(async (req, res) => {
  const data = await listAssignments(req.query, req.user);

  res.status(200).json({
    success: true,
    message: "Assignments fetched successfully.",
    data,
  });
});

export const listAssignableVolunteersHandler = asyncHandler(async (_req, res) => {
  const data = await listAssignableVolunteers();

  res.status(200).json({
    success: true,
    message: "Assignable volunteers fetched successfully.",
    data,
  });
});

export const getAssignmentByIdHandler = asyncHandler(async (req, res) => {
  const data = await getAssignmentByIdForActor(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Assignment fetched successfully.",
    data,
  });
});

export const updateAssignmentStatusHandler = asyncHandler(async (req, res) => {
  const data = await updateAssignmentStatus(
    req.params.id,
    req.body.nextStatus,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: "Assignment status updated successfully.",
    data,
  });
});

export const assignmentStatusMetadataHandler = asyncHandler(
  async (req, res) => {
    const data = getAssignmentStatusMetadata(req.params.status, req.user.role);

    res.status(200).json({
      success: true,
      message: "Assignment status metadata fetched successfully.",
      data,
    });
  },
);

export const deleteAssignmentHandler = asyncHandler(async (req, res) => {
  const data = await deleteAssignment(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully.",
    data,
  });
});
