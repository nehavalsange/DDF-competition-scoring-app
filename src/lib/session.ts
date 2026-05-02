import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

export type SessionPayload = {
  userId: string;
  username: string;
  name: string;
  role: "ADMIN" | "JUDGE";
  judgeId?: string;
  adminPermission?: "READ_ONLY" | "READ_WRITE";
};

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  return decrypt(sessionCookie);
});
