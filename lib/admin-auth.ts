import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours — covers a workshop day

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Checks `password` against ADMIN_PASSWORD; returns a cookie token on success. */
export function adminLoginToken(password: string): string | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return null;
  return hash(expected);
}

export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(hash(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminCookie(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE_NAME);
}
