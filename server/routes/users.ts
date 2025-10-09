import type { RequestHandler } from "express";
import { listPublicUsers } from "../services/users";

export const handleListUsers: RequestHandler = async (_req, res) => {
  try {
    const response = await listPublicUsers();
    return res.json(response);
  } catch (error) {
    console.error("List users error", error);
    return res.status(500).json({ error: "Impossible de récupérer les utilisateurs" });
  }
};
