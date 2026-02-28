import { env } from "../config/env.js";

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join(" ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate value detected.";
  }

  if (error.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "CORS origin denied.";
  }

  if (statusCode >= 500 && env.nodeEnv !== "development") {
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
}
