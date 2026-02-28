import { AppError } from "../utils/AppError.js";

export function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication is required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You are not authorized for this action.", 403));
    }

    return next();
  };
}
