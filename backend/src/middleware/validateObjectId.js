import mongoose from "mongoose";

import { AppError } from "../utils/AppError.js";

export function validateObjectId(paramName) {
  return (req, _res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError(`Invalid ${paramName} value.`, 400));
    }

    return next();
  };
}
