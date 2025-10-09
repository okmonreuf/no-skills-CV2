import type { RequestHandler } from "express";
import { z } from "zod";
import {
  authenticateUser,
  createSession,
  getSession,
  getUserFromSessionToken,
  invalidateSession,
} from "../services/auth";
import { toPublicUser } from "../services/users";
import { setSessionCookie, clearSessionCookie, getSessionTokenFromRequest } from "../utils/cookies";
import type { AuthCredentials, AuthResponse, SessionResponse } from "@shared/api";

const credentialsSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const payload = credentialsSchema.parse(req.body) as AuthCredentials;
    const user = await authenticateUser(payload.username, payload.password);

    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const session = createSession(user);
    setSessionCookie(res, session.token);

    const response: AuthResponse = {
      token: session.token,
      user: toPublicUser(user),
    };

    return res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }

    if (error instanceof Error && error.message === "Utilisateur banni") {
      return res.status(403).json({ error: error.message });
    }

    console.error("Login error", error);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      const session = getSession(token);
      if (session) {
        invalidateSession(session.token);
      }
    }

    clearSessionCookie(res);
    return res.status(204).send();
  } catch (error) {
    console.error("Logout error", error);
    return res.status(500).json({ error: "Erreur lors de la déconnexion" });
  }
};

export const handleSession: RequestHandler = async (req, res) => {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Session non trouvée" });
    }

    const user = await getUserFromSessionToken(token);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ error: "Session expirée" });
    }

    const response: SessionResponse = {
      user: toPublicUser(user),
    };

    return res.json(response);
  } catch (error) {
    console.error("Session error", error);
    return res.status(500).json({ error: "Erreur de session" });
  }
};
