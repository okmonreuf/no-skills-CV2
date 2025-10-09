import crypto from "crypto";
import type { ModerationLog } from "@shared/api";
import { loadData, withData } from "../storage/dataStore";
import { broadcastEvent } from "../realtime/eventBus";

export async function recordLog(entry: Omit<ModerationLog, "id" | "createdAt">): Promise<ModerationLog> {
  const now = new Date().toISOString();
  const log: ModerationLog = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
  };

  await withData((data) => {
    data.logs.unshift(log);
    if (data.logs.length > 5000) {
      data.logs = data.logs.slice(0, 5000);
    }
    return log;
  });

  broadcastEvent({ type: "moderation-log", log });
  return log;
}

export async function listLogs(limit = 250): Promise<ModerationLog[]> {
  const data = await loadData();
  return data.logs.slice(0, limit);
}
