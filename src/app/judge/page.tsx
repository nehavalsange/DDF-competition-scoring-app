import { requireJudge } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmitFinalButton } from "@/components/SubmitFinalButton";
import { StarButton } from "@/components/StarButton";
import { Trophy, CheckCircle, Clock, Play, Edit3, MapPin, Calendar } from "lucide-react";
import { getCategoryLabel } from "@/types";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default async function JudgeDashboard() {
  const session = await requireJudge();
  const judgeId = session.judgeId!;

  const assignments = await db.judgeAssignment.findMany({
    where: { judgeId },
    include: {
      competition: {
        include: {
          // sorted by teamCode ascending — no category grouping
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

  const activeAssignment =
    assignments.find((a) => a.competition.status === "PUBLISHED") || assignments[0];
  const competition = activeAssignment.competition;
  const teamIds = competition.teams.map((t) => t.id);

  const progress = await db.teamScoringProgress.findMany({
    where: { judgeId, teamId: { in: teamIds } },
  });
  const progressMap = new Map(progress.map((p) => [p.teamId, p.status]));

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
      {/* Welcome */}
      <div className="flex items-center gap-3 mb-6">
        <Image
          src="/manch-logo.png"
          alt="MANCH 2026"
          width={56}
          height={56}
          className="rounded-xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {session.name.split(" ")[0]}!
          </h1>
          <p className="text-white/40 text-sm">DDF MANCH 2026 Judging Panel</p>
        </div>
      </div>

      {/* Competition info card */}
      <Card className="mb-6 border-amber-400/25 bg-gradient-to-br from-amber-400/8 to-purple-900/20">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Active Competition
              </p>
              <h2 className="text-white font-bold text-lg">{competition.name}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-white/50 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(competition.eventDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {competition.venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  {totalTeams} teams
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-4xl font-bold text-white">{pct}%</p>
              <p className="text-white/40 text-xs">{completedCount}/{totalTeams} done</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Submit button */}
          {!isFinalized && completedCount === totalTeams && totalTeams > 0 && (
            <div className="mt-4">
              <SubmitFinalButton competitionId={competition.id} />
            </div>
          )}
          {isFinalized && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Scores submitted — thank you!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team list or status messages */}
      {competition.status !== "PUBLISHED" && !isFinalized ? (
        <div className="text-center py-12 glass rounded-3xl">
          <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-white/60 font-semibold text-lg mb-2">Competition not yet open</h2>
          <p className="text-white/30 text-sm">Scoring will open once the admin publishes the competition.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Teams</h2>
            <span className="text-white/30 text-xs">Sorted by team code · ⭐ = revisit later</span>
          </div>

          <div className="space-y-2">
            {competition.teams.map((team) => {
              const status = progressMap.get(team.id) ?? "NOT_STARTED";
              const { label, variant, icon: Icon } = statusConfig[status];

              return (
                <div key={team.id} className="flex items-center gap-2">
                  {/* Star button — outside the link so clicks don't navigate */}
                  <StarButton teamId={team.id} judgeId={judgeId} />

                  <Link href={`/judge/team/${team.id}`} className="flex-1">
                    <Card className="hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-0.5 duration-200">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Team code */}
                          <span className="text-amber-300 font-mono text-sm font-bold w-20 flex-shrink-0">
                            {team.teamCode}
                          </span>

                          {/* Name + category */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{team.teamName}</p>
                            <p className="text-white/30 text-xs">
                              {getCategoryLabel(team.category as "JR_KIDS" | "SR_KIDS" | "ADULT")}
                            </p>
                          </div>

                          {/* Status badge */}
                          <Badge variant={variant} className="text-xs flex-shrink-0">
                            <Icon className="w-3 h-3 mr-1" />
                            {label}
                          </Badge>

                          {/* Action icon */}
                          <div className="flex-shrink-0 text-white/30">
                            {status === "COMPLETED" ? (
                              <Edit3 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Play className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
