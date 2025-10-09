/**
 * Shared types between client and server for No-Skills Messagerie
 */

export interface DemoResponse {
  message: string;
}

export type UserRole = "admin" | "member";

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
  isMuted: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface SessionResponse {
  user: PublicUser;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  displayName: string;
  role?: UserRole;
  avatarData?: string | null;
}

export interface UpdateUserPayload {
  displayName?: string;
  avatarData?: string | null;
  password?: string;
  role?: UserRole;
  isMuted?: boolean;
  isBanned?: boolean;
}

export interface BaseMessage {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderRole: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GeneralMessage extends BaseMessage {
  channel: "general";
}

export interface DirectMessage extends BaseMessage {
  channel: "direct";
  recipientId: string;
  recipientUsername: string;
  recipientDisplayName: string;
}

export type Message = GeneralMessage | DirectMessage;

export type ModerationAction =
  | "ban"
  | "unban"
  | "mute"
  | "unmute"
  | "create_user"
  | "delete_message"
  | "update_profile";

export interface ModerationLog {
  id: string;
  action: ModerationAction;
  actorUsername: string;
  targetUsername?: string;
  context?: string;
  createdAt: string;
}

export type ChatEvent =
  | { type: "general-message"; message: GeneralMessage }
  | { type: "general-message-deleted"; messageId: string; moderator: string; timestamp: string }
  | { type: "direct-message"; message: DirectMessage }
  | { type: "user-status"; user: PublicUser }
  | { type: "moderation-log"; log: ModerationLog };

export interface GeneralMessagesResponse {
  messages: GeneralMessage[];
}

export interface DirectMessagesResponse {
  messages: DirectMessage[];
  peer?: PublicUser;
}

export interface UsersResponse {
  users: PublicUser[];
}

export interface LogsResponse {
  logs: ModerationLog[];
}
