import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

const SESSION_COOKIE = "ns_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const SECRET_KEY = process.env.SESSION_SECRET || "dev-secret-key-change-in-production";

type SessionPayload = {
  username: string;
  iat: number;
};

const getAdminCredentials = () => {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    console.error("❌ Missing admin credentials in environment variables");
    console.error("  ADMIN_USERNAME:", !!username);
    console.error("  ADMIN_PASSWORD_HASH:", !!passwordHash);
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD_HASH environment variables");
  }

  return { username, passwordHash };
};

// Create a signed session token
const createSessionToken = (payload: SessionPayload): string => {
  const json = JSON.stringify(payload);
  const signature = createHmac("sha256", SECRET_KEY).update(json).digest("hex");
  return `${Buffer.from(json).toString("base64")}.${signature}`;
};

// Verify and decode a signed session token
const verifySessionToken = (token: string): SessionPayload | null => {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const json = Buffer.from(encoded, "base64").toString("utf-8");
    const expectedSignature = createHmac("sha256", SECRET_KEY).update(json).digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(json) as SessionPayload;

    // Check if token has expired
    const iat = payload.iat;
    const now = Date.now();
    if (now - iat > SESSION_TTL_MS) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("❌ Session token verification failed:", error);
    return null;
  }
};

const getSessionToken = (req: Parameters<RequestHandler>[0]) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  return payload;
};

const issueSession = (res: Parameters<RequestHandler>[1], username: string) => {
  const payload: SessionPayload = {
    username,
    iat: Date.now(),
  };

  const token = createSessionToken(payload);
  console.log("🎫 Session issued for user:", username);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
  console.log("🍪 Cookie set:", SESSION_COOKIE, "- secure:", process.env.NODE_ENV === "production");
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as {
      username?: unknown;
      password?: unknown;
    };

    console.log("🔐 Login attempt for username:", username);

    if (typeof username !== "string" || typeof password !== "string") {
      console.error("❌ Invalid payload: username or password not strings");
      return res.status(400).json({ success: false, message: "invalid_payload" });
    }

    const { username: adminUsername, passwordHash } = getAdminCredentials();
    console.log("✓ Admin credentials loaded, admin username:", adminUsername);

    if (username !== adminUsername) {
      console.error("❌ Username mismatch:", username, "!==", adminUsername);
      return res.status(401).json({ success: false, message: "invalid_credentials" });
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    console.log("✓ Password comparison result:", isValid);

    if (!isValid) {
      console.error("❌ Invalid password");
      return res.status(401).json({ success: false, message: "invalid_credentials" });
    }

    console.log("✅ Login successful, issuing session");
    issueSession(res, adminUsername);

    return res.json({ success: true, username: adminUsername });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "internal_error" });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  console.log("🚪 User logged out");
  return res.json({ success: true });
};

export const handleSession: RequestHandler = (req, res) => {
  const cookie = req.cookies?.[SESSION_COOKIE];
  console.log("🔍 Session check - cookie present:", !!cookie);

  const session = getSessionToken(req);
  if (!session) {
    console.error("❌ No valid session found");
    return res.status(401).json({ success: false });
  }

  console.log("✅ Valid session found for user:", session.username);
  return res.json({ success: true, username: session.username });
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const session = getSessionToken(req);
  if (!session) {
    return res.status(401).json({ success: false });
  }

  res.locals.authenticatedUser = session.username;
  return next();
};
