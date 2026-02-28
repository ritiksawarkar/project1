import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { authRoles, isValidAuthRole } from "../utils/authRoles.js";
import { signAccessToken } from "../utils/jwt.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeEmail(value) {
  return sanitizeText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildAuthResponse(userDocument) {
  const safeUser = userDocument.toSafeObject();
  const token = signAccessToken({
    sub: safeUser.id,
    role: safeUser.role,
  });

  return {
    user: safeUser,
    token,
  };
}

export async function registerUser(payload) {
  const name = sanitizeText(payload?.name);
  const email = sanitizeEmail(payload?.email);
  const password =
    typeof payload?.password === "string" ? payload.password : "";
  const requestedRole = sanitizeText(payload?.role);
  const role = requestedRole || authRoles.donor;

  if (name.length < 2) {
    throw new AppError("Name must be at least 2 characters.", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Email format is invalid.", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  if (!isValidAuthRole(role)) {
    throw new AppError("Role is invalid.", 400);
  }

  if (role === authRoles.admin) {
    throw new AppError("Admin registration is not allowed via this endpoint.", 403);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User with this email already exists.", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return buildAuthResponse(user);
}

export async function loginUser(payload) {
  const email = sanitizeEmail(payload?.email);
  const password =
    typeof payload?.password === "string" ? payload.password : "";

  if (!isValidEmail(email)) {
    throw new AppError("Email format is invalid.", 400);
  }

  if (!password) {
    throw new AppError("Password is required.", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive.", 403);
  }

  return buildAuthResponse(user);
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive.", 403);
  }

  return user.toSafeObject();
}
