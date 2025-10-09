import crypto from "crypto";
import type {
  DirectMessage,
  DirectMessagesResponse,
  GeneralMessage,
  GeneralMessagesResponse,
  PublicUser,
} from "@shared/api";
import { withData, loadData } from "../storage/dataStore";
import type { StoredUser } from "../types";
import { broadcastEvent } from "../realtime/eventBus";
import { recordLog } from "./logs";

export async function listGeneralMessages(limit = 200): Promise<GeneralMessagesResponse> {
  const data = await loadData();
  const messages = data.generalMessages
    .filter((message) => !message.deletedAt)
    .slice(-limit);
  return { messages };
}

export async function listDirectMessages(
  user: StoredUser,
  peer: StoredUser,
  limit = 200,
): Promise<DirectMessagesResponse> {
  const data = await loadData();
  const messages = data.directMessages.filter((message) => {
    const participants = [message.senderId, message.recipientId];
    return participants.includes(user.id) && participants.includes(peer.id);
  });
  return { messages: messages.slice(-limit) };
}

function buildMessageBase(sender: StoredUser) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    content: "",
    senderId: sender.id,
    senderUsername: sender.username,
    senderDisplayName: sender.displayName,
    senderRole: sender.role,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createGeneralMessage(
  sender: StoredUser,
  content: string,
): Promise<GeneralMessage> {
  if (sender.isMuted) {
    throw new Error("Utilisateur muet");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message vide");
  }

  const message: GeneralMessage = {
    ...buildMessageBase(sender),
    content: trimmed,
    channel: "general",
  };

  await withData((data) => {
    data.generalMessages.push(message);
    if (data.generalMessages.length > 1000) {
      data.generalMessages = data.generalMessages.slice(-1000);
    }
    return message;
  });

  broadcastEvent({ type: "general-message", message });
  return message;
}

export async function createDirectMessage(
  sender: StoredUser,
  recipient: StoredUser,
  content: string,
): Promise<DirectMessage> {
  if (sender.isMuted) {
    throw new Error("Utilisateur muet");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message vide");
  }

  const message: DirectMessage = {
    ...buildMessageBase(sender),
    content: trimmed,
    channel: "direct",
    recipientId: recipient.id,
    recipientUsername: recipient.username,
    recipientDisplayName: recipient.displayName,
  };

  await withData((data) => {
    data.directMessages.push(message);
    if (data.directMessages.length > 2000) {
      data.directMessages = data.directMessages.slice(-2000);
    }
    return message;
  });

  broadcastEvent({ type: "direct-message", message });
  return message;
}

export async function deleteGeneralMessage(
  moderator: StoredUser,
  messageId: string,
): Promise<void> {
  await withData((data) => {
    const target = data.generalMessages.find((message) => message.id === messageId);
    if (!target) {
      throw new Error("Message introuvable");
    }
    target.deletedAt = new Date().toISOString();
    target.updatedAt = target.deletedAt;
    return null;
  });

  broadcastEvent({
    type: "general-message-deleted",
    messageId,
    moderator: moderator.username,
    timestamp: new Date().toISOString(),
  });

  await recordLog({
    action: "delete_message",
    actorUsername: moderator.username,
    context: `Suppression message ${messageId}`,
  });
}

export function getParticipantPublicSummary(user: StoredUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isMuted: user.isMuted,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
