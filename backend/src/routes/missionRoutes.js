import { Router } from "express";

import {
  createMissionHandler,
  deleteMissionHandler,
  getMissionByIdHandler,
  listMissionsHandler,
  missionStatusMetadataHandler,
  updateMissionStatusHandler,
} from "../controllers/missionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { missionValidators } from "../middleware/validators.js";

const missionRoutes = Router();

missionRoutes.use(authenticate);

missionRoutes.get(
  "/",
  missionValidators.list,
  validateRequest,
  listMissionsHandler,
);
missionRoutes.post(
  "/",
  missionValidators.create,
  validateRequest,
  createMissionHandler,
);
missionRoutes.get(
  "/status-metadata/:status",
  missionValidators.statusMetadata,
  validateRequest,
  missionStatusMetadataHandler,
);
missionRoutes.get(
  "/:id",
  missionValidators.byId,
  validateRequest,
  getMissionByIdHandler,
);
missionRoutes.patch(
  "/:id/status",
  missionValidators.updateStatus,
  validateRequest,
  updateMissionStatusHandler,
);
missionRoutes.delete(
  "/:id",
  missionValidators.byId,
  validateRequest,
  deleteMissionHandler,
);

export default missionRoutes;
