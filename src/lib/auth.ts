import "server-only";
import { getSession } from "./session";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/judge");
  return session;
}

export async function requireAdminWrite() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/judge");
  if (session.adminPermission === "READ_ONLY") {
    throw new Error("Read-only admins cannot perform write operations.");
  }
  return session;
}

export async function requirePrimaryAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/judge");
  if (session.adminPermission !== null && session.adminPermission !== undefined) {
    throw new Error("Only the primary admin can manage admin accounts.");
  }
  return session;
}

export async function requireJudge() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "JUDGE") redirect("/admin");
  return session;
}
