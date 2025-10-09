import crypto from "crypto";
import type {
  CreateUserPayload,
  ModerationAction,
  PublicUser,
  UpdateUserPayload,
  UsersResponse,
  UserRole,
} from "@shared/api";
import { loadData, saveData, withData } from "../storage/dataStore";
import type { StoredUser } from "../types";
import { hashPassword } from "./password";
import { recordLog } from "./logs";
import { broadcastEvent } from "../realtime/eventBus";

export function toPublicUser(user: StoredUser): PublicUser {
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

export async function getStoredUserById(id: string): Promise<StoredUser | null> {
  const data = await loadData();
  return data.users.find((user) => user.id === id) ?? null;
}

export async function getStoredUserByUsername(username: string): Promise<StoredUser | null> {
  const data = await loadData();
  return data.users.find((user) => user.username === username) ?? null;
}

export async function listPublicUsers(): Promise<UsersResponse> {
  const data = await loadData();
  const users = [...data.users]
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map(toPublicUser);
  return { users };
}

function broadcastUser(user: StoredUser): void {
  broadcastEvent({ type: "user-status", user: toPublicUser(user) });
}

export async function createUserAccount(
  actor: StoredUser,
  payload: CreateUserPayload,
): Promise<StoredUser> {
  const { username, password, displayName, role = "member", avatarData = null } = payload;

  if (!username.trim()) {
    throw new Error("Nom d'utilisateur requis");
  }

  if (!displayName.trim()) {
    throw new Error("Nom affiché requis");
  }

  const created = await withData((data) => {
    const existing = data.users.find((user) => user.username === username);
    if (existing) {
      throw new Error("Nom d'utilisateur déjà utilisé");
    }

    const now = new Date().toISOString();
    const { salt, hash } = hashPassword(password);
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      username: username.trim(),
      displayName: displayName.trim(),
      role,
      avatarUrl: avatarData,
      isMuted: false,
      isBanned: false,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: now,
      updatedAt: now,
    };

    data.users.push(newUser);
    return newUser;
  });

  broadcastUser(created);
  await recordLog({
    action: "create_user",
    actorUsername: actor.username,
    targetUsername: created.username,
    context: `Création du compte ${created.displayName}`,
  });

  return created;
}

export async function updateUserProfile(
  actor: StoredUser,
  username: string,
  updates: UpdateUserPayload,
): Promise<StoredUser> {
  const data = await loadData();
  const index = data.users.findIndex((user) => user.username === username);
  if (index === -1) {
    throw new Error("Utilisateur introuvable");
  }

  const user = data.users[index];
  const now = new Date().toISOString();

  if (typeof updates.displayName === "string") {
    user.displayName = updates.displayName.trim();
  }

  if (typeof updates.avatarData !== "undefined") {
    user.avatarUrl = updates.avatarData;
  }

  if (typeof updates.role === "string") {
    user.role = updates.role as UserRole;
  }

  if (typeof updates.password === "string" && updates.password.length > 0) {
    const { salt, hash } = hashPassword(updates.password);
    user.passwordSalt = salt;
    user.passwordHash = hash;
  }

  user.updatedAt = now;
  data.users[index] = user;
  await saveData(data);

  broadcastUser(user);
  await recordLog({
    action: "update_profile",
    actorUsername: actor.username,
    targetUsername: user.username,
    context: "Mise à jour du profil utilisateur",
  });

  return user;
}

export async function applyModerationAction(
  actor: StoredUser,
  action: ModerationAction,
  username: string,
  context?: string,
): Promise<StoredUser> {
  const target = await getStoredUserByUsername(username);
  if (!target) {
    throw new Error("Utilisateur introuvable");
  }

  if (target.id === actor.id && (action === "ban" || action === "mute")) {
    throw new Error("Action impossible sur votre propre compte");
  }

  const data = await loadData();
  const index = data.users.findIndex((user) => user.id === target.id);
  const user = data.users[index];

  const now = new Date().toISOString();
  let performed = action;

  switch (action) {
    case "ban":
      user.isBanned = true;
      break;
    case "unban":
      user.isBanned = false;
      break;
    case "mute":
      user.isMuted = true;
      break;
    case "unmute":
      user.isMuted = false;
      break;
    default:
      performed = action;
      break;
  }

  user.updatedAt = now;
  data.users[index] = user;
  await saveData(data);

  broadcastUser(user);
  await recordLog({
    action: performed,
    actorUsername: actor.username,
    targetUsername: user.username,
    context,
  });

  return user;
}
