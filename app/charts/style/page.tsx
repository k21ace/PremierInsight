import { getStandings, getHomeAwayStandings } from "@/lib/football-api";
import { calcTeamStyles, calcHomeAwayStats } from "@/lib/chart-utils";
import StyleChartPC from "@/components/charts/StyleChartPC";
import StyleChartSP from "@/components/charts/StyleChartSP";
import HomeAwayClient from "../home-away/HomeAwayClient";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = createMetadata(
  "プレミアリーグ 攻撃スタイル・H/A分析 2025-26 | PremierNow",
  "全20チームの得点力・守備力の散布図と、ホームvsアウェイ成績比較。",
  "/charts/style",
  "プレミアリーグ スタイル分析 2025-26",
);

export default async function StylePage() {
  const [standingsData, homeAwayData] = await Promise.all([
    getStandings(),
    getHomeAwayStandings(),
  ]);

  const table =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ?? [];
  const teamStyles = calcTeamStyles(table);
  const haStats = calcHomeAwayStats(homeAwayData.home, homeAwayData.away);

  const season = standingsData.season;
  const seasonLabel = season
    ? `${season.startDate.slice(0, 4)}–${season.endDate.slice(2, 4)}`
    : "";

  return (
    <main className="min-h-screen bg-pn-bg dark:bg-gray-950 py-6 space-y-12">

      {/* ── 攻撃スタイル分析 ── */}
      <section className="max-w-5xl mx-auto px-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-1">
          攻撃スタイル分析
          {seasonLabel && (
            <span className="ml-2 text-sm font-normal text-gray-500">{seasonLabel}</span>
          )}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          右上ほど得点力・守備力ともに優れたチーム。中央の点線は全チームの平均値。
        </p>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-2">
          <div className="hidden md:block">
            <StyleChartPC teamStyles={teamStyles} />
          </div>
          <div className="block md:hidden">
            <StyleChartSP teamStyles={teamStyles} />
          </div>
        </div>
      </section>

      {/* ── ホーム vs アウェイ 成績比較 ── */}
      <section>
        <div className="max-w-5xl mx-auto px-4 mb-0">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            ホーム vs アウェイ 成績比較
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ホームとアウェイで成績に差があるチームを分析します。
            差が大きいチームほどホームの雰囲気に影響されやすい傾向があります。
          </p>
        </div>
        <HomeAwayClient stats={haStats} />
      </section>

    </main>
  );
}
