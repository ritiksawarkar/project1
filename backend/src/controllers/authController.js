import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data,
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data,
  });
});

export const me = asyncHandler(async (req, res) => {
  const data = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully.",
    data,
  });
});
