import { notFound } from "next/navigation";
import { getStandings, getMatches } from "@/lib/football-api";
import { JsonLd } from "@/components/JsonLd";
import TeamDetailClient, { type MatchSummary } from "./TeamDetailClient";
import type { Match } from "@/types/football";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ id: string }> };

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

  return (
    <main className="min-h-screen bg-pn-bg">
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
      />
    </main>
  );
}
