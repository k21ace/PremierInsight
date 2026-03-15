import type { Metadata } from "next";
import { getStandings, getMatches } from "@/lib/football-api";
import { matchToSimulator } from "@/lib/simulator-utils";
import { JsonLd } from "@/components/JsonLd";
import SimulatorClient from "./SimulatorClient";

const OG_TITLE =
  "プレミアリーグ 順位予測シミュレーター 2025-26 | PremierInsight";
const OG_DESC =
  "残り試合の結果を予測して最終順位をシミュレーション。あなたの予測でプレミアリーグの順位はどう変わる？";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/simulator",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("順位予測シミュレーター 2025-26")}`,
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
      `/api/og?title=${encodeURIComponent("順位予測シミュレーター 2025-26")}`,
    ],
  },
};

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
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ホーム",
              item: "https://premier-insight.vercel.app",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "予測",
              item: "https://premier-insight.vercel.app/simulator",
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
