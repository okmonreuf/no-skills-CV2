import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout, handleSession } from "./routes/auth";
import { ensureDefaultAdmin } from "./services/auth";
import { requireAdmin, requireAuth } from "./middleware/require-auth";
import { handleListUsers } from "./routes/users";
import {
  handleDeleteGeneralMessage,
  handleGetDirectMessages,
  handleGetGeneralMessages,
  handlePostDirectMessage,
  handlePostGeneralMessage,
} from "./routes/messages";
import {
  handleAdminCreateUser,
  handleAdminLogs,
  handleAdminModeration,
  handleAdminUpdateUser,
} from "./routes/admin";
import { handleEventsStream } from "./routes/events";

export function createServer() {
  const app = express();

  void ensureDefaultAdmin().catch((error) => {
    console.error("Failed to ensure default admin", error);
  });

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health route
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/session", handleSession);

  // Protected routes
  app.get("/api/events/stream", requireAuth, handleEventsStream);

  app.get("/api/users", requireAuth, handleListUsers);

  app.get("/api/messages/general", requireAuth, handleGetGeneralMessages);
  app.post("/api/messages/general", requireAuth, handlePostGeneralMessage);
  app.delete("/api/messages/general/:messageId", requireAuth, requireAdmin, handleDeleteGeneralMessage);

  app.get("/api/messages/direct/:username", requireAuth, handleGetDirectMessages);
  app.post("/api/messages/direct/:username", requireAuth, handlePostDirectMessage);

  // Admin routes
  app.post("/api/admin/users", requireAuth, requireAdmin, handleAdminCreateUser);
  app.patch("/api/admin/users/:username", requireAuth, requireAdmin, handleAdminUpdateUser);
  app.post("/api/admin/moderation", requireAuth, requireAdmin, handleAdminModeration);
  app.get("/api/admin/logs", requireAuth, requireAdmin, handleAdminLogs);

  return app;
}
