import crypto from "crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export interface PasswordHash {
  salt: string;
  hash: string;
}

export function hashPassword(password: string, salt?: string): PasswordHash {
  const actualSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto
    .pbkdf2Sync(password, actualSalt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return { salt: actualSalt, hash: derived };
}

export function verifyPassword(password: string, stored: PasswordHash): boolean {
  const { hash } = hashPassword(password, stored.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(stored.hash, "hex"));
}
