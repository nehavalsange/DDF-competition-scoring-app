import { requireJudge } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getScoringCategories, getCategoryLabel } from "@/types";
import { ScoringForm } from "@/components/ScoringForm";
import { SingingTeamComplete } from "@/components/SingingTeamComplete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, MapPin } from "lucide-react";

export default async function TeamScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireJudge();
  const judgeId = session.judgeId!;
  const { id: teamId } = await params;

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { competition: true },
  });
  if (!team) notFound();

  // Verify judge is assigned to this competition
  const assignment = await db.judgeAssignment.findUnique({
    where: {
      judgeId_competitionId: { judgeId, competitionId: team.competitionId },
    },
  });
  if (!assignment) redirect("/judge");

  // Check if finalized
  const submission = await db.scoreSubmission.findUnique({
    where: {
      judgeId_competitionId: { judgeId, competitionId: team.competitionId },
    },
  });
  const isFinalized = !!submission?.isFinalized;

  // Get existing scores
  const existingScores = await db.score.findMany({
    where: { judgeId, teamId },
  });
  const scoreMap: Record<string, number> = {};
  for (const s of existingScores) scoreMap[s.categoryName] = s.score;

  // Get progress
  const progress = await db.teamScoringProgress.findUnique({
    where: { judgeId_teamId: { judgeId, teamId } },
  });

  const isSinging = team.category === "SINGING";
  const categories = isSinging ? [] : getScoringCategories(team.category as "JR_KIDS" | "SR_KIDS" | "ADULT");

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/judge" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-white/40 text-sm">{team.competition.name}</p>
          <h1 className="text-2xl font-bold text-white">{team.teamName}</h1>
        </div>
      </div>

      {/* Team info card */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-300 font-mono font-medium">{team.teamCode}</span>
                <Badge variant="default">
                  {getCategoryLabel(team.category as "JR_KIDS" | "SR_KIDS" | "ADULT" | "SINGING")}
                </Badge>
              </div>
              <h2 className="text-white font-semibold text-lg">{team.teamName}</h2>
              {team.description && (
                <p className="text-white/50 text-sm mt-1">{team.description}</p>
              )}
            </div>
            {progress?.status === "COMPLETED" && (
              <Badge variant="success">Completed</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {isSinging ? (
        <SingingTeamComplete
          teamId={teamId}
          currentStatus={progress?.status ?? "NOT_STARTED"}
        />
      ) : isFinalized ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/60">Scores have been finalized. You cannot edit them.</p>
          <Link href="/judge" className="mt-4 inline-block">
            <Button variant="outline" size="sm">← Back to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <ScoringForm
          teamId={teamId}
          competitionId={team.competitionId}
          categories={[...categories]}
          existingScores={scoreMap}
          currentStatus={progress?.status ?? "NOT_STARTED"}
        />
      )}
    </div>
  );
}
