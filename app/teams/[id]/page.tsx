import { notFound } from "next/navigation";
import { getStandings, getMatches, getTeamInfo } from "@/lib/football-api";
import { JsonLd } from "@/components/JsonLd";
import TeamDetailClient, { type MatchSummary } from "./TeamDetailClient";
import type { Match } from "@/types/football";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { getUnderstatTeams, calcTeamXgStats } from "@/lib/understat";
import type { TeamXgStats } from "@/lib/understat";
import { calcPointsTimeline, calcProbabilities } from "@/lib/chart-utils";
import type { TeamProbabilities } from "@/lib/chart-utils";
import { getUnderstatTitle } from "@/lib/translations";

type Props = { params: Promise<{ id: string }> };

export interface TopPlayer {
  id: number;
  name: string;
  count: number;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const teamId = Number(id);
  if (isNaN(teamId)) return {};

  try {
    const data = await getStandings();
    const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? [];
    const standing = table.find((s) => s.team.id === teamId);
    if (!standing) return {};

    return createMetadata(
      `${standing.team.name} 成績・スタッツ 2025-26 | PremierNow`,
      `${standing.team.name}のプレミアリーグ成績。順位・勝点・得失点・直近試合結果を確認。`,
      `/teams/${id}`,
      `${standing.team.name} 成績 2025-26`,
    );
  } catch {
    return {};
  }
}

function buildMatchSummary(match: Match, teamId: number): MatchSummary {
  const isHome = match.homeTeam.id === teamId;
  const scored = isHome
    ? (match.score.fullTime.home ?? 0)
    : (match.score.fullTime.away ?? 0);
  const conceded = isHome
    ? (match.score.fullTime.away ?? 0)
    : (match.score.fullTime.home ?? 0);

  let result: "W" | "D" | "L" = "D";
  if (scored > conceded) result = "W";
  else if (scored < conceded) result = "L";

  const opponent = isHome ? match.awayTeam : match.homeTeam;

  return {
    id: match.id,
    utcDate: match.utcDate,
    matchday: match.matchday,
    isHome,
    opponentId: opponent.id,
    opponentName: opponent.name,
    opponentShortName: opponent.shortName,
    opponentCrest: opponent.crest,
    scored,
    conceded,
    result,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { id } = await params;
  const teamId = Number(id);

  if (isNaN(teamId)) notFound();

  const [standingsData, matchesData] = await Promise.all([
    getStandings(),
    getMatches({ status: "FINISHED" }),
  ]);

  const totalTable =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ?? [];
  const homeTable =
    standingsData.standings.find((s) => s.type === "HOME")?.table ?? [];
  const awayTable =
    standingsData.standings.find((s) => s.type === "AWAY")?.table ?? [];

  const totalStanding = totalTable.find((s) => s.team.id === teamId);
  if (!totalStanding) notFound();

  const homeStanding = homeTable.find((s) => s.team.id === teamId) ?? null;
  const awayStanding = awayTable.find((s) => s.team.id === teamId) ?? null;

  // 直近10試合（古い順）
  const recentMatches = (matchesData.matches ?? [])
    .filter(
      (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId,
    )
    .sort(
      (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime(),
    )
    .slice(0, 10)
    .reverse()
    .map((m) => buildMatchSummary(m, teamId));

  // ── 追加データ取得（任意・失敗しても他には影響しない） ────────────────

  // 監督・スタジアム情報
  let venue: string | null = null;
  let coachName: string | null = null;
  try {
    const teamInfo = await getTeamInfo(teamId);
    venue = teamInfo.venue ?? null;
    coachName = teamInfo.coach?.name ?? null;
  } catch {
    // 無料プランでは利用不可の場合あり
  }

  // Understat xG データ
  let teamXgStats: TeamXgStats | null = null;
  try {
    const understatTitle = getUnderstatTitle(teamId);
    if (understatTitle) {
      const teamsData = await getUnderstatTeams(2025);
      const allStats = calcTeamXgStats(teamsData);
      teamXgStats = allStats.find((s) => s.teamName === understatTitle) ?? null;
    }
  } catch {
    // Understat unavailable
  }

  // 確率計算（終了済み試合データから）
  let teamProbabilities: TeamProbabilities | null = null;
  try {
    const allMatches = matchesData.matches ?? [];
    if (allMatches.length > 0) {
      const timelines = calcPointsTimeline(allMatches);
      const maxMatchday = Math.max(...allMatches.map((m) => m.matchday));
      const probs = calcProbabilities(timelines, maxMatchday);
      teamProbabilities = probs.find((p) => p.teamId === teamId) ?? null;
    }
  } catch {
    // fallback
  }

  // 得点・アシストTop3（試合内ゴールデータから計算）
  const allGoals = (matchesData.matches ?? []).flatMap((m) => m.goals ?? []);
  const teamGoals = allGoals.filter(
    (g) => g.team.id === teamId && g.type !== "OWN",
  );

  const scorerMap = new Map<number, { name: string; count: number }>();
  const assisterMap = new Map<number, { name: string; count: number }>();

  for (const goal of teamGoals) {
    const { id: scorerId, name: scorerName } = goal.scorer;
    const prev = scorerMap.get(scorerId);
    scorerMap.set(scorerId, { name: scorerName, count: (prev?.count ?? 0) + 1 });

    if (goal.assist) {
      const { id: assistId, name: assistName } = goal.assist;
      const prevA = assisterMap.get(assistId);
      assisterMap.set(assistId, { name: assistName, count: (prevA?.count ?? 0) + 1 });
    }
  }

  const topScorers: TopPlayer[] = [...scorerMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([pid, { name, count }]) => ({ id: pid, name, count }));

  const topAssisters: TopPlayer[] = [...assisterMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([pid, { name, count }]) => ({ id: pid, name, count }));

  return (
    <main className="min-h-screen bg-pn-bg dark:bg-gray-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ホーム",
              item: "https://premiernow.jp",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "チーム",
              item: "https://premiernow.jp/teams",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: totalStanding.team.name,
              item: `https://premiernow.jp/teams/${id}`,
            },
          ],
        }}
      />

      <TeamDetailClient
        team={totalStanding.team}
        totalStanding={totalStanding}
        homeStanding={homeStanding}
        awayStanding={awayStanding}
        recentMatches={recentMatches}
        venue={venue}
        coachName={coachName}
        teamXgStats={teamXgStats}
        teamProbabilities={teamProbabilities}
        topScorers={topScorers}
        topAssisters={topAssisters}
      />
    </main>
  );
}
