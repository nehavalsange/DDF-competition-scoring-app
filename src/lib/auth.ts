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

export async function requireJudge() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "JUDGE") redirect("/admin");
  return session;
}
