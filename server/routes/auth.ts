import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SESSION_COOKIE = "ns_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type SessionRecord = {
  username: string;
  createdAt: number;
};

const sessions = new Map<string, SessionRecord>();

const getAdminCredentials = () => {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD_HASH environment variables");
  }

  return { username, passwordHash };
};

const pruneExpiredSessions = () => {
  const now = Date.now();
  for (const [token, record] of sessions.entries()) {
    if (now - record.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    }
  }
};

const getSessionToken = (req: Parameters<RequestHandler>[0]) => {
  pruneExpiredSessions();
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }

  return { token, session };
};

const issueSession = (res: Parameters<RequestHandler>[1], username: string) => {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { username, createdAt: Date.now() });

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as {
      username?: unknown;
      password?: unknown;
    };

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "invalid_payload" });
    }

    const { username: adminUsername, passwordHash } = getAdminCredentials();

    if (username !== adminUsername) {
      return res.status(401).json({ success: false, message: "invalid_credentials" });
    }

    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
      return res.status(401).json({ success: false, message: "invalid_credentials" });
    }

    issueSession(res, adminUsername);

    return res.json({ success: true, username: adminUsername });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ success: false, message: "internal_error" });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  const session = getSessionToken(req);
  if (session) {
    sessions.delete(session.token);
  }

  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return res.json({ success: true });
};

export const handleSession: RequestHandler = (req, res) => {
  const session = getSessionToken(req);
  if (!session) {
    return res.status(401).json({ success: false });
  }

  return res.json({ success: true, username: session.session.username });
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const session = getSessionToken(req);
  if (!session) {
    return res.status(401).json({ success: false });
  }

  res.locals.authenticatedUser = session.session.username;
  return next();
};
