import app from "./app.js";
import { connectDatabase } from "./src/config/db.js";
import { env } from "./src/config/env.js";

let isShuttingDown = false;
let server;

const gracefulShutdown = (signal, exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (!server) {
    process.exit(exitCode);
    return;
  }

  server.close(() => {
    process.exit(exitCode);
  });
};

server = app.listen(env.port, async () => {
  await connectDatabase();
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  gracefulShutdown("unhandledRejection", 1);
});
