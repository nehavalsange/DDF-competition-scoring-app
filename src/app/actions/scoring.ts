"use server";

import { db } from "@/lib/db";
import { requireJudge } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveScores(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await requireJudge();
  const judgeId = session.judgeId!;
  const teamId = formData.get("teamId") as string;
  const markComplete = formData.get("markComplete") === "true";

  // Collect all score entries from form
  const scores: { categoryName: string; score: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("score_")) {
      const categoryName = key.replace("score_", "");
      const score = parseInt(value as string, 10);
      if (isNaN(score) || score < 1 || score > 5) {
        return { error: `Invalid score for ${categoryName}. Must be 1-5.` };
      }
      scores.push({ categoryName, score });
    }
  }

  if (scores.length === 0) {
    return { error: "No scores provided." };
  }

  // Upsert each score
  for (const { categoryName, score } of scores) {
    await db.score.upsert({
      where: { judgeId_teamId_categoryName: { judgeId, teamId, categoryName } },
      update: { score },
      create: { judgeId, teamId, categoryName, score },
    });
  }

  // Update progress
  const status = markComplete ? "COMPLETED" : "IN_PROGRESS";
  await db.teamScoringProgress.upsert({
    where: { judgeId_teamId: { judgeId, teamId } },
    update: { status },
    create: { judgeId, teamId, status },
  });

  revalidatePath(`/judge/team/${teamId}`);
  revalidatePath("/judge");

  if (markComplete) {
    return { success: true };
  }
  return { success: true };
}

export async function markTeamAttended(teamId: string) {
  const session = await requireJudge();
  const judgeId = session.judgeId!;

  await db.teamScoringProgress.upsert({
    where: { judgeId_teamId: { judgeId, teamId } },
    update: { status: "COMPLETED" },
    create: { judgeId, teamId, status: "COMPLETED" },
  });

  revalidatePath(`/judge/team/${teamId}`);
  revalidatePath("/judge");
}

export async function submitFinalScores(competitionId: string) {
  const session = await requireJudge();
  const judgeId = session.judgeId!;

  // Check all teams in the competition are completed
  const teams = await db.team.findMany({
    where: { competitionId },
    select: { id: true },
  });

  const progress = await db.teamScoringProgress.findMany({
    where: { judgeId, teamId: { in: teams.map((t) => t.id) } },
  });

  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
  if (completedCount < teams.length) {
    return {
      error: `Please complete scoring for all teams. ${completedCount}/${teams.length} completed.`,
    };
  }

  // Create submission record
  await db.scoreSubmission.upsert({
    where: { judgeId_competitionId: { judgeId, competitionId } },
    update: { isFinalized: true },
    create: { judgeId, userId: session.userId, competitionId, isFinalized: true },
  });

  revalidatePath("/judge");
  redirect("/judge");
}
