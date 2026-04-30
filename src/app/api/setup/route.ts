import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// One-time setup endpoint to create the admin user
// Remove or secure this route after initial setup
export async function POST(request: NextRequest) {
  const setupKey = request.headers.get("x-setup-key");
  if (setupKey !== process.env.SETUP_KEY && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, username, password } = body;

  if (!name || !username || !password) {
    return NextResponse.json({ error: "name, username, password required" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, username, passwordHash, role: "ADMIN" },
    select: { id: true, name: true, username: true, role: true },
  });

  return NextResponse.json({ success: true, user });
}
