import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Star, Users, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryLabel } from "@/types";
import {
  calculateJrSrWinners,
  calculateAdultWinners,
  calculateJrSrWinnersOverall,
  calculateAdultWinnersOverall,
} from "@/lib/winners";
import { ExportResultsButton } from "@/components/ExportResultsButton";

type SearchParams = Promise<{ judgeId?: string }>;

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { id } = await params;
  const { judgeId } = await searchParams;

  const competition = await db.competition.findUnique({
    where: { id },
    include: {
      judgeAssignments: {
        include: { user: true, judge: true },
      },
      teams: { orderBy: { teamCode: "asc" } },
    },
  });
  if (!competition) notFound();

  const selectedJudge = judgeId
    ? competition.judgeAssignments.find((a) => a.judge.id === judgeId)
    : null;

  // Per-judge results
  let jrWinners = null;
  let srWinners = null;
  let adultWinners = null;

  if (selectedJudge) {
    jrWinners = await calculateJrSrWinners(selectedJudge.judge.id, "JR_KIDS", id);
    srWinners = await calculateJrSrWinners(selectedJudge.judge.id, "SR_KIDS", id);
    adultWinners = await calculateAdultWinners(selectedJudge.judge.id, id);
  }

  // Overall results
  const overallJrWinners = await calculateJrSrWinnersOverall("JR_KIDS", id);
  const overallSrWinners = await calculateJrSrWinnersOverall("SR_KIDS", id);
  const overallAdultWinners = await calculateAdultWinnersOverall(id);

  // Scores for judge view
  let judgeScores: Array<{
    teamCode: string;
    teamName: string;
    category: string;
    scores: Record<string, number>;
    total: number;
  }> = [];

  if (selectedJudge) {
    const teams = await db.team.findMany({
      where: { competitionId: id },
      include: {
        scores: { where: { judgeId: selectedJudge.judge.id } },
      },
      orderBy: { teamCode: "asc" },
    });
    judgeScores = teams.map((t) => {
      const scoreMap: Record<string, number> = {};
      for (const s of t.scores) scoreMap[s.categoryName] = s.score;
      const total = Object.values(scoreMap).reduce((a, b) => a + b, 0);
      return {
        teamCode: t.teamCode,
        teamName: t.teamName,
        category: t.category,
        scores: scoreMap,
        total,
      };
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <Link href={`/admin/competitions/${id}`} className="text-white/40 hover:text-white transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">Results</h1>
          <p className="text-white/50">{competition.name}</p>
        </div>
        <div className="flex gap-2 no-print">
          <ExportResultsButton competitionId={id} competitionName={competition.name} />
          <Button variant="outline" size="sm" onClick={() => {}} className="no-print" asChild>
            <button onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </button>
          </Button>
        </div>
      </div>

      {/* Judge selector */}
      <div className="flex flex-wrap gap-2 mb-8 no-print">
        <Link href={`/admin/competitions/${id}/results`}>
          <Button variant={!judgeId ? "default" : "outline"} size="sm">
            <Star className="w-4 h-4" /> Overall Results
          </Button>
        </Link>
        {competition.judgeAssignments.map((a) => (
          <Link key={a.id} href={`/admin/competitions/${id}/results?judgeId=${a.judge.id}`}>
            <Button variant={judgeId === a.judge.id ? "default" : "outline"} size="sm">
              <Users className="w-4 h-4" /> {a.user.name}
            </Button>
          </Link>
        ))}
      </div>

      {selectedJudge ? (
        // Per-judge view
        <div className="space-y-8">
          <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-white font-semibold">{selectedJudge.user.name}</p>
              <p className="text-white/40 text-sm">@{selectedJudge.user.username}</p>
            </div>
          </div>

          {/* Winners for this judge */}
          <div className="grid md:grid-cols-3 gap-6">
            <WinnersCard title="Jr Kids" icon="🥇" results={jrWinners ?? []} />
            <WinnersCard title="Sr Kids" icon="🥈" results={srWinners ?? []} />
            <WinnersCard title="Adult Awards" icon="🏆" results={adultWinners ?? []} />
          </div>

          {/* Score tables */}
          {["JR_KIDS", "SR_KIDS", "ADULT"].map((cat) => {
            const catScores = judgeScores.filter((s) => s.category === cat);
            if (catScores.length === 0) return null;
            const allCats = [...new Set(catScores.flatMap((s) => Object.keys(s.scores)))];
            return (
              <div key={cat}>
                <h3 className="text-white font-semibold mb-3">
                  {getCategoryLabel(cat as "JR_KIDS" | "SR_KIDS" | "ADULT")} — Score Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 text-white/50 font-medium">Team</th>
                        {allCats.map((c) => (
                          <th key={c} className="py-2 px-2 text-white/50 font-medium text-center whitespace-nowrap text-xs">{c}</th>
                        ))}
                        <th className="py-2 px-3 text-white/50 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catScores
                        .sort((a, b) => b.total - a.total)
                        .map((row, i) => (
                          <tr key={row.teamCode} className={`border-b border-white/5 ${i === 0 ? "bg-violet-500/10" : ""}`}>
                            <td className="py-2 px-3">
                              <span className="text-violet-300 font-mono text-xs mr-2">{row.teamCode}</span>
                              <span className="text-white/70">{row.teamName}</span>
                            </td>
                            {allCats.map((c) => (
                              <td key={c} className="py-2 px-2 text-center text-white/60">
                                {row.scores[c] ?? "—"}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-right text-white font-semibold">{row.total}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Overall view
        <div className="space-y-8">
          <div className="glass rounded-2xl px-5 py-3 flex items-center gap-2 text-white/60 text-sm">
            <Star className="w-4 h-4 text-violet-400" />
            Combined results from all judges (average scores)
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <WinnersCard title="Jr Kids" icon="🥇" results={overallJrWinners} />
            <WinnersCard title="Sr Kids" icon="🥈" results={overallSrWinners} />
            <WinnersCard title="Adult Awards" icon="🏆" results={overallAdultWinners} />
          </div>
        </div>
      )}
    </div>
  );
}

function WinnersCard({
  title,
  icon,
  results,
}: {
  title: string;
  icon: string;
  results: Array<{ award: string; winners: { teamCode: string; teamName: string }[]; score: number; tied: boolean }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span>{icon}</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.length === 0 ? (
          <p className="text-white/30 text-sm">No scores yet.</p>
        ) : (
          results.map((r) => (
            <div key={r.award} className="glass rounded-xl p-3">
              <p className="text-white/50 text-xs font-medium mb-1.5">{r.award}</p>
              {r.winners.length === 0 ? (
                <p className="text-white/20 text-xs">No eligible teams</p>
              ) : (
                <div className="space-y-1">
                  {r.winners.map((w) => (
                    <div key={w.teamCode} className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-violet-300 font-mono text-xs">{w.teamCode}</span>
                      <span className="text-white text-sm">{w.teamName}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/30 text-xs">Score: {r.score}</span>
                    {r.tied && <Badge variant="warning" className="text-xs">Tie</Badge>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
