"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TeamCategory } from "@/types";
import { TeamCategory as PrismaTeamCategory, PerformanceType as PrismaPerformanceType } from "@/generated/prisma";

export async function createCompetition(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const eventDate = formData.get("eventDate") as string;
  const venue = formData.get("venue") as string;
  const description = formData.get("description") as string;

  if (!name || !eventDate || !venue) {
    return { error: "Name, date, and venue are required." };
  }

  const competition = await db.competition.create({
    data: {
      name,
      eventDate: new Date(eventDate),
      venue,
      description: description || null,
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/competitions/${competition.id}`);
}

export async function addTeam(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await requireAdmin();
  const competitionId = formData.get("competitionId") as string;
  const teamCode = formData.get("teamCode") as string;
  const teamName = formData.get("teamName") as string;
  const category = formData.get("category") as TeamCategory;
  const performanceType = (formData.get("performanceType") as PrismaPerformanceType) ?? "DANCING";
  const description = formData.get("description") as string;

  if (!competitionId || !teamCode || !teamName || !category) {
    return { error: "All fields except description are required." };
  }

  try {
    await db.team.create({
      data: { competitionId, teamCode, teamName, category, performanceType, description: description || null },
    });
  } catch {
    return { error: "Team code must be unique within the competition." };
  }

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function deleteTeam(teamId: string, competitionId: string) {
  await requireAdmin();
  await db.team.delete({ where: { id: teamId } });
  revalidatePath(`/admin/competitions/${competitionId}`);
}

export async function updateTeam(
  teamId: string,
  competitionId: string,
  data: { teamCode: string; teamName: string; category: PrismaTeamCategory; performanceType: PrismaPerformanceType; description: string }
) {
  await requireAdmin();
  try {
    await db.team.update({
      where: { id: teamId },
      data: {
        teamCode: data.teamCode,
        teamName: data.teamName,
        category: data.category,
        performanceType: data.performanceType,
        description: data.description || null,
      },
    });
  } catch {
    return { error: "Team code must be unique within this competition." };
  }
  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function addJudge(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  await requireAdmin();
  const competitionId = formData.get("competitionId") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!competitionId || !name || !username || !password) {
    return { error: "All fields are required." };
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return { error: "Username already taken." };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, username, passwordHash, role: "JUDGE" },
  });

  const judge = await db.judge.create({ data: { userId: user.id } });

  await db.judgeAssignment.create({
    data: { judgeId: judge.id, competitionId, userId: user.id },
  });

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function removeJudge(judgeAssignmentId: string, competitionId: string) {
  await requireAdmin();
  await db.judgeAssignment.delete({ where: { id: judgeAssignmentId } });
  revalidatePath(`/admin/competitions/${competitionId}`);
}

export async function publishCompetition(competitionId: string) {
  await requireAdmin();
  await db.competition.update({
    where: { id: competitionId },
    data: { status: "PUBLISHED" },
  });
  revalidatePath(`/admin/competitions/${competitionId}`);
  revalidatePath("/admin");
}

export async function completeCompetition(competitionId: string) {
  await requireAdmin();
  await db.competition.update({
    where: { id: competitionId },
    data: { status: "COMPLETED" },
  });
  revalidatePath(`/admin/competitions/${competitionId}`);
  revalidatePath("/admin");
}

export async function deleteCompetition(competitionId: string) {
  await requireAdmin();
  const teams = await db.team.findMany({ where: { competitionId }, select: { id: true } });
  const teamIds = teams.map((t) => t.id);
  await db.score.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.teamScoringProgress.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.scoreSubmission.deleteMany({ where: { competitionId } });
  await db.judgeAssignment.deleteMany({ where: { competitionId } });
  await db.team.deleteMany({ where: { competitionId } });
  await db.competition.delete({ where: { id: competitionId } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteCompetitionWithAuth(
  competitionId: string,
  username: string,
  password: string
) {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { username } });
  if (!user || user.role !== "ADMIN") return { error: "Invalid credentials." };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Invalid credentials." };

  const teams = await db.team.findMany({ where: { competitionId }, select: { id: true } });
  const teamIds = teams.map((t) => t.id);
  await db.score.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.teamScoringProgress.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.scoreSubmission.deleteMany({ where: { competitionId } });
  await db.judgeAssignment.deleteMany({ where: { competitionId } });
  await db.team.deleteMany({ where: { competitionId } });
  await db.competition.delete({ where: { id: competitionId } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetCompetitionScores(competitionId: string) {
  await requireAdmin();
  const teams = await db.team.findMany({ where: { competitionId }, select: { id: true } });
  const teamIds = teams.map((t) => t.id);
  await db.score.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.teamScoringProgress.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.scoreSubmission.deleteMany({ where: { competitionId } });
  revalidatePath(`/admin/competitions/${competitionId}`);
}

export async function resetCompetitionScoresWithAuth(
  competitionId: string,
  username: string,
  password: string
) {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { username } });
  if (!user || user.role !== "ADMIN") return { error: "Invalid credentials." };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Invalid credentials." };

  const teams = await db.team.findMany({ where: { competitionId }, select: { id: true } });
  const teamIds = teams.map((t) => t.id);
  await db.score.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.teamScoringProgress.deleteMany({ where: { teamId: { in: teamIds } } });
  await db.scoreSubmission.deleteMany({ where: { competitionId } });
  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function createAdminUser(name: string, username: string, password: string) {
  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return { error: "Admin already exists." };
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { name, username, passwordHash, role: "ADMIN" } });
  return { success: true };
}
