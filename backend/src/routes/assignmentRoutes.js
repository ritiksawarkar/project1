import { Router } from "express";

import {
  assignmentStatusMetadataHandler,
  createAssignmentHandler,
  deleteAssignmentHandler,
  getAssignmentByIdHandler,
  listAssignableVolunteersHandler,
  listAssignmentsHandler,
  updateAssignmentStatusHandler,
} from "../controllers/assignmentController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { assignmentValidators } from "../middleware/validators.js";

const assignmentRoutes = Router();

assignmentRoutes.use(authenticate);

assignmentRoutes.get(
  "/",
  assignmentValidators.list,
  validateRequest,
  listAssignmentsHandler,
);
assignmentRoutes.post(
  "/",
  assignmentValidators.create,
  validateRequest,
  createAssignmentHandler,
);
assignmentRoutes.get(
  "/volunteers",
  assignmentValidators.listVolunteers,
  validateRequest,
  listAssignableVolunteersHandler,
);
assignmentRoutes.get(
  "/status-metadata/:status",
  assignmentValidators.statusMetadata,
  validateRequest,
  assignmentStatusMetadataHandler,
);
assignmentRoutes.get(
  "/:id",
  assignmentValidators.byId,
  validateRequest,
  getAssignmentByIdHandler,
);
assignmentRoutes.patch(
  "/:id/status",
  assignmentValidators.updateStatus,
  validateRequest,
  updateAssignmentStatusHandler,
);
assignmentRoutes.delete(
  "/:id",
  assignmentValidators.byId,
  validateRequest,
  deleteAssignmentHandler,
);

export default assignmentRoutes;
