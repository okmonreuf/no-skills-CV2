import type { Response } from "express";
import { SESSION_COOKIE_NAME } from "../services/auth";

const isProduction = process.env.NODE_ENV === "production";

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });
}

export function getSessionTokenFromRequest(req: { headers: Record<string, string | string[] | undefined> }): string | null {
  const cookiesHeader = req.headers["cookie"];
  if (!cookiesHeader) {
    return null;
  }
  const cookies = parseCookies(Array.isArray(cookiesHeader) ? cookiesHeader.join(";") : cookiesHeader);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}
