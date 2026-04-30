import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId");
  if (!competitionId) {
    return NextResponse.json({ error: "Missing competitionId" }, { status: 400 });
  }

  const competition = await db.competition.findUnique({
    where: { id: competitionId },
    include: { teams: true },
  });
  if (!competition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const assignments = await db.judgeAssignment.findMany({
    where: { competitionId },
    include: { user: true, judge: true },
  });

  const scores = await db.score.findMany({
    where: {
      team: { competitionId },
      judgeId: { in: assignments.map((a) => a.judge.id) },
    },
    include: { team: true, judge: { include: { user: true } } },
  });

  // Build CSV rows
  const rows: string[][] = [];
  const headers = ["Team Code", "Team Name", "Category", "Judge", "Category Name", "Score"];
  rows.push(headers);

  for (const score of scores) {
    rows.push([
      score.team.teamCode,
      score.team.teamName,
      score.team.category,
      score.judge.user.name,
      score.categoryName,
      score.score.toString(),
    ]);
  }

  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="results.csv"`,
    },
  });
}
