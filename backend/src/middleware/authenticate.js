import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing.", 401));
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(new AppError("Authentication token is invalid.", 401));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      return next(new AppError("Authenticated user is not available.", 401));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (_error) {
    return next(
      new AppError("Authentication token is invalid or expired.", 401),
    );
  }
}
