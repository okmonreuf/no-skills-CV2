import crypto from "crypto";
import { loadData, saveData } from "../storage/dataStore";
import { hashPassword, verifyPassword } from "./password";
import { StoredUser } from "../types";
import { getStoredUserById } from "./users";

export const DEFAULT_ADMIN_USERNAME = "yupi";
export const DEFAULT_ADMIN_PASSWORD = "1616Dh!dofly";
export const SESSION_COOKIE_NAME = "nsk_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface Session {
  token: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

export async function ensureDefaultAdmin(): Promise<void> {
  const data = await loadData();
  const existing = data.users.find((user) => user.username === DEFAULT_ADMIN_USERNAME);
  if (existing) {
    return;
  }

  const now = new Date().toISOString();
  const { salt, hash } = hashPassword(DEFAULT_ADMIN_PASSWORD);
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    username: DEFAULT_ADMIN_USERNAME,
    displayName: "Administrateur",
    role: "admin",
    avatarUrl: null,
    isMuted: false,
    isBanned: false,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: now,
    updatedAt: now,
  };

  data.users.push(newUser);
  await saveData(data);
}

export function createSession(user: StoredUser): Session {
  const token = crypto.randomUUID();
  const now = Date.now();
  const session: Session = {
    token,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  sessions.set(token, session);
  return session;
}

export function touchSession(session: Session): void {
  const now = Date.now();
  session.updatedAt = now;
  session.expiresAt = now + SESSION_TTL_MS;
  sessions.set(session.token, session);
}

export function invalidateSession(token: string): void {
  sessions.delete(token);
}

export function getSession(token: string | undefined | null): Session | null {
  if (!token) {
    return null;
  }
  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export async function getUserFromSessionToken(
  token: string | undefined | null,
): Promise<StoredUser | null> {
  const session = getSession(token);
  if (!session) {
    return null;
  }

  const user = await getStoredUserById(session.userId);
  if (!user) {
    invalidateSession(session.token);
    return null;
  }

  if (user.isBanned) {
    invalidateSession(session.token);
    return null;
  }

  touchSession(session);
  return user;
}

export async function requireUserFromSessionToken(
  token: string | undefined | null,
): Promise<StoredUser> {
  const user = await getUserFromSessionToken(token);
  if (!user) {
    throw new Error("Session invalide");
  }
  return user;
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<StoredUser | null> {
  const data = await loadData();
  const user = data.users.find((candidate) => candidate.username === username);
  if (!user) {
    return null;
  }

  if (!verifyPassword(password, { salt: user.passwordSalt, hash: user.passwordHash })) {
    return null;
  }

  if (user.isBanned) {
    throw new Error("Utilisateur banni");
  }

  return user;
}
