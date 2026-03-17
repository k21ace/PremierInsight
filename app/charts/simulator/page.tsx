import { getStandings, getMatches } from "@/lib/football-api";
import { matchToSimulator } from "@/lib/simulator-utils";
import { JsonLd } from "@/components/JsonLd";
import SimulatorClient from "./SimulatorClient";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "プレミアリーグ 順位予測シミュレーター 2025-26 | PremierNow",
  "残り試合の結果を予測して最終順位をシミュレーション。あなたの予測でプレミアリーグの順位はどう変わる？",
  "/charts/simulator",
  "順位予測シミュレーター 2025-26",
);

export default async function SimulatorPage() {
  const [standingsData, matchesData] = await Promise.all([
    getStandings(),
    getMatches({ status: "SCHEDULED" }),
  ]);

  const standings =
    standingsData.standings.find((s) => s.type === "TOTAL")?.table ??
    standingsData.standings[0]?.table ?? [];

  // 予定試合を SimulatorMatch に変換
  const scheduledMatches = (matchesData.matches ?? [])
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .sort((a, b) => a.matchday - b.matchday);

  const allMatches = scheduledMatches.map(matchToSimulator);

  // 表示する直近3節分の matchday を取得
  const allMatchdays = [...new Set(scheduledMatches.map((m) => m.matchday))].sort(
    (a, b) => a - b,
  );
  const displayMatchdays = allMatchdays.slice(0, 3);

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
              name: "分析",
              item: "https://premiernow.jp/charts/race",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "順位予測",
              item: "https://premiernow.jp/charts/simulator",
            },
          ],
        }}
      />

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-0">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          順位予測シミュレーター
        </h1>
      </div>

      <SimulatorClient
        standings={standings}
        allMatches={allMatches}
        displayMatchdays={displayMatchdays}
      />
    </main>
  );
}
