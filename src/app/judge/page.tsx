import { requireJudge } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmitFinalButton } from "@/components/SubmitFinalButton";
import { Trophy, CheckCircle, Clock, Play, Edit3, Star } from "lucide-react";
import { getCategoryLabel } from "@/types";

export default async function JudgeDashboard() {
  const session = await requireJudge();
  const judgeId = session.judgeId!;

  // Get judge's assigned competition(s)
  const assignments = await db.judgeAssignment.findMany({
    where: { judgeId },
    include: {
      competition: {
        include: {
          teams: { orderBy: { teamCode: "asc" } },
        },
      },
    },
  });

  if (assignments.length === 0) {
    return (
      <div className="text-center py-20">
        <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h2 className="text-white/60 font-semibold text-lg mb-2">No competition assigned</h2>
        <p className="text-white/30 text-sm">Please contact the admin to assign you to a competition.</p>
      </div>
    );
  }

  // Use first published competition
  const activeAssignment = assignments.find((a) => a.competition.status === "PUBLISHED") || assignments[0];
  const competition = activeAssignment.competition;

  const teamIds = competition.teams.map((t) => t.id);

  // Get progress for all teams
  const progress = await db.teamScoringProgress.findMany({
    where: { judgeId, teamId: { in: teamIds } },
  });
  const progressMap = new Map(progress.map((p) => [p.teamId, p.status]));

  // Check if finalized
  const submission = await db.scoreSubmission.findUnique({
    where: { judgeId_competitionId: { judgeId, competitionId: competition.id } },
  });
  const isFinalized = !!submission?.isFinalized;

  const totalTeams = competition.teams.length;
  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
  const pct = totalTeams > 0 ? Math.round((completedCount / totalTeams) * 100) : 0;

  const statusConfig = {
    NOT_STARTED: { label: "Not Started", variant: "secondary" as const, icon: Play },
    IN_PROGRESS: { label: "In Progress", variant: "warning" as const, icon: Edit3 },
    COMPLETED: { label: "Completed", variant: "success" as const, icon: CheckCircle },
  };

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-violet-400" />
          <h1 className="text-3xl font-bold text-white">Welcome, {session.name.split(" ")[0]}</h1>
        </div>
        <p className="text-white/50">
          {competition.name} — {competition.venue}
        </p>
      </div>

      {/* Progress banner */}
      <Card className="mb-8">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold">Scoring Progress</p>
              <p className="text-white/40 text-sm">{completedCount} of {totalTeams} teams completed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{pct}%</p>
              {isFinalized && <Badge variant="success" className="text-xs">Submitted</Badge>}
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {!isFinalized && completedCount === totalTeams && totalTeams > 0 && (
            <div className="mt-4">
              <SubmitFinalButton competitionId={competition.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {isFinalized ? (
        <div className="text-center py-12 glass rounded-3xl">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Scores Submitted!</h2>
          <p className="text-white/50">Your scores have been submitted. Thank you for judging.</p>
        </div>
      ) : competition.status !== "PUBLISHED" ? (
        <div className="text-center py-12 glass rounded-3xl">
          <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-white/60 font-semibold text-lg mb-2">Competition not yet published</h2>
          <p className="text-white/30 text-sm">Scoring will open once the admin publishes the competition.</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-white mb-4">Teams</h2>

          {/* Group by category */}
          {(["JR_KIDS", "SR_KIDS", "ADULT"] as const).map((cat) => {
            const catTeams = competition.teams.filter((t) => t.category === cat);
            if (catTeams.length === 0) return null;

            return (
              <div key={cat} className="mb-8">
                <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  {getCategoryLabel(cat)}
                  <span className="text-white/20">({catTeams.length})</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {catTeams.map((team) => {
                    const status = progressMap.get(team.id) ?? "NOT_STARTED";
                    const { label, variant, icon: Icon } = statusConfig[status];

                    return (
                      <Link key={team.id} href={`/judge/team/${team.id}`}>
                        <Card className="hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-0.5 duration-200">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-violet-300 font-mono text-sm font-medium">
                                    {team.teamCode}
                                  </span>
                                  <Badge variant={variant} className="text-xs">
                                    <Icon className="w-3 h-3 mr-1" />
                                    {label}
                                  </Badge>
                                </div>
                                <p className="text-white font-medium truncate">{team.teamName}</p>
                                {team.description && (
                                  <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{team.description}</p>
                                )}
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                {status === "COMPLETED" ? (
                                  <Edit3 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Play className="w-4 h-4 text-violet-400" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
