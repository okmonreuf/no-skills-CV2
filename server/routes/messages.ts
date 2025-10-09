import type { RequestHandler } from "express";
import { z } from "zod";
import {
  createDirectMessage,
  createGeneralMessage,
  deleteGeneralMessage,
  listDirectMessages,
  listGeneralMessages,
} from "../services/messages";
import { getStoredUserByUsername, toPublicUser } from "../services/users";
import type { AuthenticatedRequest } from "../middleware/require-auth";

const messageSchema = z.object({
  content: z.string().min(1, "Message requis").max(2000, "Message trop long"),
});

export const handleGetGeneralMessages: RequestHandler = async (_req, res) => {
  try {
    const response = await listGeneralMessages();
    return res.json(response);
  } catch (error) {
    console.error("General messages error", error);
    return res.status(500).json({ error: "Impossible de récupérer les messages" });
  }
};

export const handlePostGeneralMessage: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const payload = messageSchema.parse(req.body);
    const message = await createGeneralMessage(authUser, payload.content);
    return res.status(201).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }

    if (error instanceof Error) {
      if (error.message === "Utilisateur muet") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "Message vide") {
        return res.status(400).json({ error: error.message });
      }
    }

    console.error("Create general message error", error);
    return res.status(500).json({ error: "Impossible d'envoyer le message" });
  }
};

export const handleDeleteGeneralMessage: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: "Identifiant du message requis" });
    }
    await deleteGeneralMessage(authUser, messageId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Message introuvable") {
        return res.status(404).json({ error: error.message });
      }
    }
    console.error("Delete message error", error);
    return res.status(500).json({ error: "Impossible de supprimer le message" });
  }
};

export const handleGetDirectMessages: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Destinataire requis" });
    }

    const target = await getStoredUserByUsername(username);
    if (!target) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const response = await listDirectMessages(authUser, target);
    return res.json({ ...response, peer: toPublicUser(target) });
  } catch (error) {
    console.error("Direct messages error", error);
    return res.status(500).json({ error: "Impossible de récupérer les messages privés" });
  }
};

export const handlePostDirectMessage: RequestHandler = async (req, res) => {
  try {
    const { authUser } = req as AuthenticatedRequest;
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Destinataire requis" });
    }

    const target = await getStoredUserByUsername(username);
    if (!target) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (target.isBanned) {
      return res.status(403).json({ error: "Utilisateur cible indisponible" });
    }

    const payload = messageSchema.parse(req.body);
    const message = await createDirectMessage(authUser, target, payload.content);
    return res.status(201).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(", ") });
    }
    if (error instanceof Error) {
      if (error.message === "Utilisateur muet") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "Message vide") {
        return res.status(400).json({ error: error.message });
      }
    }
    console.error("Create direct message error", error);
    return res.status(500).json({ error: "Impossible d'envoyer le message privé" });
  }
};
