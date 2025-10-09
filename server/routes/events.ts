import type { RequestHandler } from "express";
import { setupSSEHeaders, unregisterClient } from "../realtime/eventBus";
import type { AuthenticatedRequest } from "../middleware/require-auth";
import { toPublicUser } from "../services/users";

export const handleEventsStream: RequestHandler = (req, res) => {
  const { authUser } = req as AuthenticatedRequest;
  const clientId = setupSSEHeaders(res);

  res.write(`event: welcome\n`);
  res.write(`data: ${JSON.stringify({ user: toPublicUser(authUser) })}\n\n`);

  req.on("close", () => {
    unregisterClient(clientId);
  });
};
