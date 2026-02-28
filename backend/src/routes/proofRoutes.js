import { Router } from "express";

import {
  createProofHandler,
  deleteProofHandler,
  getProofByIdHandler,
  listProofsHandler,
  proofStatusMetadataHandler,
  updateProofStatusHandler,
} from "../controllers/proofController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { proofValidators } from "../middleware/validators.js";
import { authRoles } from "../utils/authRoles.js";

const proofRoutes = Router();

proofRoutes.use(authenticate);

proofRoutes.get("/", proofValidators.list, validateRequest, listProofsHandler);
proofRoutes.post(
  "/",
  proofValidators.create,
  validateRequest,
  createProofHandler,
);
proofRoutes.get(
  "/status-metadata/:status",
  proofValidators.statusMetadata,
  validateRequest,
  proofStatusMetadataHandler,
);
proofRoutes.get(
  "/:id",
  proofValidators.byId,
  validateRequest,
  getProofByIdHandler,
);
proofRoutes.patch(
  "/:id/status",
  authorizeRoles(authRoles.admin),
  proofValidators.updateStatus,
  validateRequest,
  updateProofStatusHandler,
);
proofRoutes.delete(
  "/:id",
  proofValidators.byId,
  validateRequest,
  deleteProofHandler,
);

export default proofRoutes;
