import { validationResult } from "express-validator";

import { AppError } from "../utils/AppError.js";

export function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const message = result
    .array({ onlyFirstError: true })
    .map((error) => `${error.path}: ${error.msg}`)
    .join("; ");

  return next(new AppError(message || "Request validation failed.", 400));
}
