import { Router } from "express";

import {
  getAdminOverviewHandler,
  listUsersHandler,
  updateUserActiveStateHandler,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { adminValidators } from "../middleware/validators.js";
import { authRoles } from "../utils/authRoles.js";

const adminRoutes = Router();

adminRoutes.use(authenticate, authorizeRoles(authRoles.admin));

adminRoutes.get("/overview", getAdminOverviewHandler);
adminRoutes.get(
  "/users",
  adminValidators.listUsers,
  validateRequest,
  listUsersHandler,
);
adminRoutes.patch(
  "/users/:id/active-state",
  adminValidators.updateUserActiveState,
  validateRequest,
  updateUserActiveStateHandler,
);

export default adminRoutes;
