import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddTeamForm } from "@/components/AddTeamForm";
import { AddJudgeForm } from "@/components/AddJudgeForm";
import { PublishButton } from "@/components/PublishButton";
import { DeleteTeamButton } from "@/components/DeleteTeamButton";
import { DeleteCompetitionButton } from "@/components/DeleteCompetitionButton";
import { ResetScoresButton } from "@/components/ResetScoresButton";
import { formatDate } from "@/lib/utils";
import { getCategoryLabel, TeamCategory } from "@/types";
import {
  ArrowLeft, Calendar, MapPin, Users, Trophy,
  BarChart3, CheckCircle, Clock, AlertCircle
} from "lucide-react";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const competition = await db.competition.findUnique({
    where: { id },
    include: {
      teams: { orderBy: { teamCode: "asc" } },
      judgeAssignments: {
        include: {
          user: true,
          judge: {
            include: {
              scoreSubmissions: true,
              teamProgress: true,
            },
          },
        },
      },
    },
  });

  if (!competition) notFound();

  const totalTeams = competition.teams.length;
  const teamIds = new Set(competition.teams.map((t) => t.id));

  const statusConfig = {
    DRAFT: { label: "Draft", variant: "secondary" as const },
    PUBLISHED: { label: "Published", variant: "success" as const },
    COMPLETED: { label: "Completed", variant: "info" as const },
  };
  const { label, variant } = statusConfig[competition.status];

  const categoryGroups: Record<string, typeof competition.teams> = {
    JR_KIDS: competition.teams.filter((t) => t.category === "JR_KIDS"),
    SR_KIDS: competition.teams.filter((t) => t.category === "SR_KIDS"),
    ADULT: competition.teams.filter((t) => t.category === "ADULT"),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <Link href="/admin" className="text-white/40 hover:text-white transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">{competition.name}</h1>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(competition.eventDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {competition.venue}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {competition.status !== "DRAFT" && (
            <Link href={`/admin/competitions/${id}/results`}>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4" /> Results
              </Button>
            </Link>
          )}
          <ResetScoresButton competitionId={id} />
          <PublishButton competitionId={id} status={competition.status} />
          <DeleteCompetitionButton competitionId={id} />
        </div>
      </div>

      {/* Judge Progress */}
      {competition.judgeAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            Judge Progress
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {competition.judgeAssignments.map((assignment) => {
              // Only count progress for teams in this competition
              const relevantProgress = assignment.judge.teamProgress.filter((p) =>
                teamIds.has(p.teamId)
              );
              const completed = relevantProgress.filter((p) => p.status === "COMPLETED").length;
              const pct = totalTeams > 0 ? Math.round((completed / totalTeams) * 100) : 0;
              const isFinalized = assignment.judge.scoreSubmissions.some(
                (s) => s.competitionId === id && s.isFinalized
              );

              return (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium text-sm">{assignment.user.name}</p>
                      <p className="text-white/40 text-xs">@{assignment.user.username}</p>
                    </div>
                    {isFinalized ? (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />Submitted
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />In Progress
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{completed}/{totalTeams} teams</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {competition.status !== "DRAFT" && (
                    <Link href={`/admin/competitions/${id}/results?judgeId=${assignment.judge.id}`}>
                      <Button variant="ghost" size="sm" className="w-full mt-3 text-xs h-7">
                        View Scores
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Teams */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-fuchsia-400" />
            Teams ({totalTeams})
          </h2>

          {totalTeams === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-white/40">
              No teams added yet. Use the form to add teams.
            </div>
          ) : (
            Object.entries(categoryGroups).map(([cat, teams]) => {
              if (teams.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                      {getCategoryLabel(cat as TeamCategory)}
                    </h3>
                    <span className="text-white/30 text-xs">({teams.length})</span>
                  </div>
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div key={team.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-fuchsia-300 text-sm font-mono font-medium">
                              {team.teamCode}
                            </span>
                            <span className="text-white text-sm">{team.teamName}</span>
                          </div>
                          {team.description && (
                            <p className="text-white/30 text-xs mt-0.5 line-clamp-1">
                              {team.description}
                            </p>
                          )}
                        </div>
                        <DeleteTeamButton teamId={team.id} competitionId={id} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-fuchsia-400" /> Add Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddTeamForm competitionId={id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-fuchsia-400" /> Add Judge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddJudgeForm competitionId={id} />
            </CardContent>
          </Card>

          {competition.judgeAssignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Judges ({competition.judgeAssignments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {competition.judgeAssignments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300 text-xs font-semibold">
                      {a.user.name[0]}
                    </div>
                    <div>
                      <span className="text-white">{a.user.name}</span>
                      <span className="text-white/30 ml-1.5 text-xs">@{a.user.username}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {competition.status === "DRAFT" && (totalTeams === 0 || competition.judgeAssignments.length === 0) && (
            <div className="glass rounded-xl p-4 flex gap-2 text-sm text-amber-300 border border-amber-500/20 bg-amber-500/5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Add at least one team and one judge before publishing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
