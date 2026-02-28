import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./src/config/env.js";
import authRoutes from "./src/routes/authRoutes.js";
import missionRoutes from "./src/routes/missionRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import proofRoutes from "./src/routes/proofRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { notFoundHandler } from "./src/middleware/notFound.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const allowedOrigins = new Set(env.corsOrigins);

app.disable("x-powered-by");
app.set("trust proxy", env.trustProxy);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    data: {
      uptime: process.uptime(),
      environment: env.nodeEnv,
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/missions", missionRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/proofs", proofRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
