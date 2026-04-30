"use server";

import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const user = await db.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid credentials." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Invalid credentials." };

  let judgeId: string | undefined;
  if (user.role === "JUDGE") {
    const judge = await db.judge.findUnique({ where: { userId: user.id } });
    judgeId = judge?.id;
  }

  await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role as "ADMIN" | "JUDGE",
    judgeId,
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/judge");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
