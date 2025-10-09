import type { RequestHandler } from "express";
import { z } from "zod";
import {
  applyModerationAction,
  createUserAccount,
  updateUserProfile,
  toPublicUser,
} from "../services/users";
import type { AuthenticatedRequest } from "../middleware/require-auth";
import { listLogs } from "../services/logs";

const createUserSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(64),
  displayName: z.string().min(3).max(64),
  role: z.enum(["admin", "member"]).optional(),
  avatarData: z.string().nullable().optional(),
});

const updateUserSchema = z.object({
  displayName: z.string().min(3).max(64).optional(),
  password: z.string().min(8).max(64).optional(),
  avatarData: z.string().nullable().optional(),
  role: z.enum(["admin", "member"]).optional(),
});

const moderationSchema = z.object({
  action: z.enum(["ban", "unban", "mute", "unmute"]),
  username: z.string().min(1),
  context: z.string().max(200).optional(),
});

export const handleAdminCreateUser: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const payload = createUserSchema.parse(req.body);
    const user = await createUserAccount(authUser, payload);
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Create user error", error);
    return res.status(500).json({ error: "Impossible de créer l'utilisateur" });
  }
};

export const handleAdminUpdateUser: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const payload = updateUserSchema.parse(req.body);
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Nom d'utilisateur requis" });
    }
    const user = await updateUserProfile(authUser, username, payload);
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Update user error", error);
    return res.status(500).json({ error: "Impossible de mettre à jour l'utilisateur" });
  }
};

export const handleAdminModeration: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const payload = moderationSchema.parse(req.body);
    const user = await applyModerationAction(authUser, payload.action, payload.username, payload.context);
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Moderation error", error);
    return res.status(500).json({ error: "Impossible d'appliquer l'action" });
  }
};

export const handleAdminLogs: RequestHandler = async (_req, res) => {
  try {
    const logs = await listLogs();
    return res.json({ logs });
  } catch (error) {
    console.error("Logs error", error);
    return res.status(500).json({ error: "Impossible de récupérer les journaux" });
  }
};
