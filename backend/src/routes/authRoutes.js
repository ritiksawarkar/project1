import { Router } from "express";

import { login, me, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authValidators } from "../middleware/validators.js";

const authRoutes = Router();

authRoutes.post(
  "/register",
  authValidators.register,
  validateRequest,
  register,
);
authRoutes.post("/login", authValidators.login, validateRequest, login);
authRoutes.get("/me", authenticate, me);

export default authRoutes;
