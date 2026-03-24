import { getMatches, getStandings } from "@/lib/football-api";
import { calcPointsTimeline } from "@/lib/chart-utils";
import RaceChart from "./RaceChart";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = createMetadata(
  "プレミアリーグ 優勝・CL・残留確率 2025-26 | PremierNow",
  "勝点レースチャートと優勝確率・CL圏確率・残留確率をリアルタイムで確認。",
  "/charts/race",
  "プレミアリーグ 優勝・CL・残留確率 2025-26",
);

export default async function AnalysisPage() {
  const [finishedData, standingsData] = await Promise.all([
    getMatches({ status: "FINISHED" }),
    getStandings(),
  ]);

  const timelines = calcPointsTimeline(finishedData.matches ?? []);
  const table =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ?? [];
  const groupTeamIds = {
    title: table.slice(0, 3).map((s) => s.team.id),
    cl: table.slice(2, 10).map((s) => s.team.id),
    relegation: table.slice(15, 20).map((s) => s.team.id),
  };
  const safeZoneTeamId = table[16]?.team.id ?? null;

  return (
    <main className="min-h-screen bg-pn-bg dark:bg-gray-950 py-6">
      <section className="max-w-5xl mx-auto px-4">
        <RaceChart
          timelines={timelines}
          matches={finishedData.matches ?? []}
          groupTeamIds={groupTeamIds}
          safeZoneTeamId={safeZoneTeamId}
        />
      </section>
    </main>
  );
}
