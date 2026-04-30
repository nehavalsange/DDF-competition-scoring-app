import { db } from "./db";
import { TeamCategory } from "@/types";

type TeamScore = {
  teamId: string;
  teamCode: string;
  teamName: string;
  scores: Record<string, number>;
  total: number;
};

type WinnerResult = {
  award: string;
  winners: { teamCode: string; teamName: string }[];
  score: number;
  tied: boolean;
};

async function getTeamScoresForJudge(
  judgeId: string,
  category: TeamCategory,
  competitionId: string
): Promise<TeamScore[]> {
  const teams = await db.team.findMany({
    where: { competitionId, category },
    include: {
      scores: { where: { judgeId } },
    },
  });

  return teams.map((team) => {
    const scoreMap: Record<string, number> = {};
    for (const s of team.scores) {
      scoreMap[s.categoryName] = s.score;
    }
    const total = Object.values(scoreMap).reduce((a, b) => a + b, 0);
    return {
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      scores: scoreMap,
      total,
    };
  });
}

async function getTeamAverageScores(
  category: TeamCategory,
  competitionId: string
): Promise<TeamScore[]> {
  const teams = await db.team.findMany({
    where: { competitionId, category },
    include: { scores: true },
  });

  return teams.map((team) => {
    // Group scores by category and compute average
    const grouped: Record<string, number[]> = {};
    for (const s of team.scores) {
      if (!grouped[s.categoryName]) grouped[s.categoryName] = [];
      grouped[s.categoryName].push(s.score);
    }
    const avgMap: Record<string, number> = {};
    for (const [cat, vals] of Object.entries(grouped)) {
      avgMap[cat] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    const total = Object.values(avgMap).reduce((a, b) => a + b, 0);
    return {
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      scores: avgMap,
      total,
    };
  });
}

function sumCategories(scores: Record<string, number>, cats: string[]): number {
  return cats.reduce((acc, cat) => acc + (scores[cat] ?? 0), 0);
}

function getHighestScorer(
  teams: TeamScore[],
  getCategoryScore: (t: TeamScore) => number,
  excluded: Set<string>
): { winners: TeamScore[]; score: number; tied: boolean } | null {
  const eligible = teams.filter((t) => !excluded.has(t.teamId));
  if (eligible.length === 0) return null;

  const scored = eligible.map((t) => ({
    team: t,
    catScore: getCategoryScore(t),
  }));

  const maxCat = Math.max(...scored.map((s) => s.catScore));
  const topTeams = scored.filter((s) => s.catScore === maxCat);

  if (topTeams.length === 1) {
    return {
      winners: [topTeams[0].team],
      score: maxCat,
      tied: false,
    };
  }

  // Tiebreak: highest total of all 9 categories
  const maxTotal = Math.max(...topTeams.map((s) => s.team.total));
  const tiedByTotal = topTeams.filter((s) => s.team.total === maxTotal);

  return {
    winners: tiedByTotal.map((s) => s.team),
    score: maxCat,
    tied: tiedByTotal.length > 1,
  };
}

export async function calculateJrSrWinners(
  judgeId: string,
  category: "JR_KIDS" | "SR_KIDS",
  competitionId: string
): Promise<WinnerResult[]> {
  const teams = await getTeamScoresForJudge(judgeId, category, competitionId);
  if (teams.length === 0) return [];

  const maxTotal = Math.max(...teams.map((t) => t.total));
  const winners = teams.filter((t) => t.total === maxTotal);

  const label = category === "JR_KIDS" ? "Jr Kids Winner" : "Sr Kids Winner";
  return [
    {
      award: label,
      winners: winners.map((w) => ({ teamCode: w.teamCode, teamName: w.teamName })),
      score: maxTotal,
      tied: winners.length > 1,
    },
  ];
}

export async function calculateAdultWinners(
  judgeId: string,
  competitionId: string
): Promise<WinnerResult[]> {
  const teams = await getTeamScoresForJudge(judgeId, "ADULT", competitionId);
  if (teams.length === 0) return [];

  const excluded = new Set<string>();
  const results: WinnerResult[] = [];

  const awards: { award: string; cats: string[] }[] = [
    {
      award: "Best Choreography",
      cats: ["Precision", "Choreo", "Creativity", "Expression", "Theme", "Technique", "Props"],
    },
    {
      award: "Technique",
      cats: ["Precision", "Choreo", "Expression", "Theme", "Technique"],
    },
    {
      award: "Most Expressive",
      cats: ["Connect", "Choreo", "Creativity", "Expression", "Theme"],
    },
    {
      award: "Best Stage Presence",
      cats: ["Stage Presence", "Precision", "Connect", "Theme"],
    },
  ];

  for (const { award, cats } of awards) {
    const result = getHighestScorer(teams, (t) => sumCategories(t.scores, cats), excluded);
    if (!result) {
      results.push({ award, winners: [], score: 0, tied: false });
      continue;
    }
    results.push({
      award,
      winners: result.winners.map((w) => ({ teamCode: w.teamCode, teamName: w.teamName })),
      score: result.score,
      tied: result.tied,
    });
    // Rule 1: winning team cannot win another award
    if (!result.tied) {
      excluded.add(result.winners[0].teamId);
    } else {
      // If tied, none of the tied teams are excluded (they all share the award)
      for (const w of result.winners) excluded.add(w.teamId);
    }
  }

  return results;
}

// ---- Combined (all judges average) ----

export async function calculateJrSrWinnersOverall(
  category: "JR_KIDS" | "SR_KIDS",
  competitionId: string
): Promise<WinnerResult[]> {
  const teams = await getTeamAverageScores(category, competitionId);
  if (teams.length === 0) return [];

  const maxTotal = Math.max(...teams.map((t) => t.total));
  const winners = teams.filter((t) => t.total === maxTotal);

  const label = category === "JR_KIDS" ? "Jr Kids Overall Winner" : "Sr Kids Overall Winner";
  return [
    {
      award: label,
      winners: winners.map((w) => ({ teamCode: w.teamCode, teamName: w.teamName })),
      score: Math.round(maxTotal * 100) / 100,
      tied: winners.length > 1,
    },
  ];
}

export async function calculateAdultWinnersOverall(
  competitionId: string
): Promise<WinnerResult[]> {
  const teams = await getTeamAverageScores("ADULT", competitionId);
  if (teams.length === 0) return [];

  const excluded = new Set<string>();
  const results: WinnerResult[] = [];

  const awards: { award: string; cats: string[] }[] = [
    {
      award: "Best Choreography",
      cats: ["Precision", "Choreo", "Creativity", "Expression", "Theme", "Technique", "Props"],
    },
    {
      award: "Technique",
      cats: ["Precision", "Choreo", "Expression", "Theme", "Technique"],
    },
    {
      award: "Most Expressive",
      cats: ["Connect", "Choreo", "Creativity", "Expression", "Theme"],
    },
    {
      award: "Best Stage Presence",
      cats: ["Stage Presence", "Precision", "Connect", "Theme"],
    },
  ];

  for (const { award, cats } of awards) {
    const result = getHighestScorer(teams, (t) => sumCategories(t.scores, cats), excluded);
    if (!result) {
      results.push({ award, winners: [], score: 0, tied: false });
      continue;
    }
    results.push({
      award,
      winners: result.winners.map((w) => ({ teamCode: w.teamCode, teamName: w.teamName })),
      score: Math.round(result.score * 100) / 100,
      tied: result.tied,
    });
    for (const w of result.winners) excluded.add(w.teamId);
  }

  return results;
}

export type { WinnerResult, TeamScore };
