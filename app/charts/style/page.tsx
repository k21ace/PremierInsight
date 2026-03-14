import type { Metadata } from "next";
import { getStandings } from "@/lib/football-api";
import { calcTeamStyles } from "@/lib/chart-utils";
import StyleChartPC from "@/components/charts/StyleChartPC";
import StyleChartSP from "@/components/charts/StyleChartSP";

export const revalidate = 3600;

const OG_TITLE = "プレミアリーグ 攻撃スタイル分析 2025-26 | PremierInsight";
const OG_DESC =
  "全20チームの得点力・守備力を散布図で可視化。チームの戦術傾向が一目でわかります。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/charts/style",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ 攻撃スタイル分析 2025-26")}`,
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
      `/api/og?title=${encodeURIComponent("プレミアリーグ 攻撃スタイル分析 2025-26")}`,
    ],
  },
};

export default async function StylePage() {
  const standingsData = await getStandings();
  const table =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ?? [];
  const teamStyles = calcTeamStyles(table);

  const season = standingsData.season;
  const seasonLabel = season
    ? `${season.startDate.slice(0, 4)}–${season.endDate.slice(2, 4)}`
    : "";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
          攻撃スタイル分析
          {seasonLabel && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              {seasonLabel}
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          右上ほど得点力・守備力ともに優れたチーム。中央の点線は全チームの平均値。
        </p>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          {/* PC版 */}
          <div className="hidden md:block">
            <StyleChartPC teamStyles={teamStyles} />
          </div>
          {/* SP版 */}
          <div className="block md:hidden">
            <StyleChartSP teamStyles={teamStyles} />
          </div>
        </div>
      </div>
    </main>
  );
}
