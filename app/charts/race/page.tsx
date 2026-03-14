import type { Metadata } from "next";
import { getMatches, getStandings } from "@/lib/football-api";
import { calcPointsTimeline } from "@/lib/chart-utils";
import RaceChart from "./RaceChart";

export const revalidate = 3600;

const OG_TITLE =
  "プレミアリーグ 優勝争い・降格争いチャート 2025-26 | PremierInsight";
const OG_DESC =
  "節ごとの勝点推移を可視化。優勝争いと降格争いをリアルタイムで追えます。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/charts/race",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ 優勝争い・降格争いチャート 2025-26")}`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [
      `/api/og?title=${encodeURIComponent("プレミアリーグ 優勝争い・降格争いチャート 2025-26")}`,
    ],
  },
};

export default async function RacePage() {
  const [finishedData, standingsData] = await Promise.all([
    getMatches({ status: "FINISHED" }),
    getStandings(),
  ]);

  const timelines = calcPointsTimeline(finishedData.matches ?? []);

  // TOTAL 順位表から各グループのチームIDを決定
  const table =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ?? [];
  const groupTeamIds = {
    title: table.slice(0, 3).map((s) => s.team.id),
    cl: table.slice(2, 7).map((s) => s.team.id),
    relegation: table.slice(15, 20).map((s) => s.team.id),
  };
  // 降格争いアノテーション用：17位チームID（降格圏外の境界）
  const safeZoneTeamId = table[16]?.team.id ?? null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <RaceChart
          timelines={timelines}
          matches={finishedData.matches ?? []}
          groupTeamIds={groupTeamIds}
          safeZoneTeamId={safeZoneTeamId}
        />
      </div>
    </main>
  );
}
