import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { config as loadEnv } from "dotenv";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout, handleSession } from "./routes/auth";

// Load server/.env first, with override enabled
loadEnv({ path: path.resolve(process.cwd(), "server/.env"), override: true });

// Then load root .env files (for other env vars like NODE_ENV)
loadEnv({ override: false });

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all origins in development, but require credentials
        callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Log all requests for debugging
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path} - cookies:`, Object.keys(req.cookies || {}));
    next();
  });

  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/session", handleSession);

  // Debug endpoint (remove in production)
  app.get("/api/debug/env", (_req, res) => {
    res.json({
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? "✓ set" : "✗ missing",
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? "✓ set" : "✗ missing",
      NODE_ENV: process.env.NODE_ENV ?? "development",
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
