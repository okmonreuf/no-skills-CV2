import { DirectMessage, GeneralMessage, ModerationLog, UserRole } from "@shared/api";

export interface StoredUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
  isMuted: boolean;
  isBanned: boolean;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  users: StoredUser[];
  generalMessages: GeneralMessage[];
  directMessages: DirectMessage[];
  logs: ModerationLog[];
}
