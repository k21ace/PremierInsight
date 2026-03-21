import {
  getUnderstatTeams,
  getUnderstatPlayers,
  calcTeamXgStats,
} from "@/lib/understat";
import XgClient from "./XgClient";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 86400;

export const metadata = createMetadata(
  "プレミアリーグ xG（ゴール期待値）分析 2025-26 | PremierNow",
  "プレミアリーグ全チーム・選手のxG（ゴール期待値）ランキング。決定力が高いチーム・選手を分析します。",
  "/charts/xg",
  "プレミアリーグ xG 分析 2025-26",
);

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
            xG xA 分析
            <span className="ml-2 text-sm font-normal text-gray-500">2025-26</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Understat のデータをもとにした期待得点（xG）・アシスト期待値（xA）分析。
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
            xG xA 分析
          </h1>
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-sm text-gray-500">
            データを取得できませんでした。しばらく経ってからアクセスしてください。
          </div>
        </div>
      </main>
    );
  }
}
