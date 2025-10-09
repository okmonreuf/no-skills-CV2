import type { ChatEvent } from "@shared/api";
import type { Response } from "express";

import crypto from "crypto";

interface Client {
  id: string;
  res: Response;
}

const clients = new Map<string, Client>();

export function registerClient(res: Response): string {
  const id = crypto.randomUUID();
  clients.set(id, { id, res });
  res.on("close", () => {
    clients.delete(id);
  });
  return id;
}

export function setupSSEHeaders(res: Response): string {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(":ok\n\n");
  return registerClient(res);
}

export function unregisterClient(id: string): void {
  const client = clients.get(id);
  if (client) {
    client.res.end();
    clients.delete(id);
  }
}

export function broadcastEvent(event: ChatEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const { res } of clients.values()) {
    res.write(payload);
  }
}
