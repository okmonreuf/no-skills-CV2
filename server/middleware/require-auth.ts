import type { Request, RequestHandler } from "express";
import { getSessionTokenFromRequest } from "../utils/cookies";
import { requireUserFromSessionToken } from "../services/auth";
import type { StoredUser } from "../types";

export interface AuthenticatedRequest extends Request {
  authUser: StoredUser;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = getSessionTokenFromRequest(req);
    const user = await requireUserFromSessionToken(token);
    (req as AuthenticatedRequest).authUser = user;
    return next();
  } catch (error) {
    console.error("Authorization error", error);
    return res.status(401).json({ error: "Authentification requise" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as AuthenticatedRequest).authUser;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Privilèges administrateur requis" });
  }
  return next();
};
