import type { Metadata } from "next";
import {
  getUnderstatTeams,
  getUnderstatPlayers,
  calcTeamXgStats,
} from "@/lib/understat";
import XgClient from "./XgClient";

export const revalidate = 86400;

const OG_TITLE = "プレミアリーグ xG（ゴール期待値）分析 2025-26 | PremierNow";
const OG_DESC =
  "プレミアリーグ全チーム・選手のxG（ゴール期待値）ランキング。決定力が高いチーム・選手を分析します。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/charts/xg",
    siteName: "PremierNow",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ xG 分析 2025-26")}`,
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
    images: [`/api/og?title=${encodeURIComponent("プレミアリーグ xG 分析 2025-26")}`],
  },
};

export default async function XgPage() {
  try {
    const [teamsData, playersData] = await Promise.all([
      getUnderstatTeams(2025),
      getUnderstatPlayers(2025),
    ]);
    const teamStats = calcTeamXgStats(teamsData);

    return (
      <main className="min-h-screen bg-pn-bg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
            xG 分析
            <span className="ml-2 text-sm font-normal text-gray-500">2025-26</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Understat のデータをもとにした期待得点（xG）分析。
          </p>
          <XgClient teamStats={teamStats} players={playersData} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen bg-pn-bg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
            xG 分析
          </h1>
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-sm text-gray-500">
            データを取得できませんでした。しばらく経ってからアクセスしてください。
          </div>
        </div>
      </main>
    );
  }
}
