import { getUnderstatTeams } from "@/lib/understat";
import ShotMapClient from "./ShotMapClient";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = createMetadata(
  "プレミアリーグ シュートマップ 2025-26 | PremierNow",
  "プレミアリーグ各チームのシュート位置をピッチ上にプロット。xG・決定機エリアを可視化します。",
  "/charts/shotmap",
  "プレミアリーグ シュートマップ 2025-26",
);

const DEFAULT_TEAM = "Arsenal";

export default async function ShotMapPage() {
  try {
    const teamsData = await getUnderstatTeams(2025);
    const teamTitles = Object.values(teamsData)
      .map((t) => t.title)
      .sort((a, b) => a.localeCompare(b));

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
            シュートマップ
            <span className="ml-2 text-sm font-normal text-gray-500">2025-26</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Understat のデータをもとにした各チームのシュート位置・xG 可視化。
          </p>
          {/* シュートデータはクライアントで非同期取得（初回ロード時のみ時間がかかります） */}
          <ShotMapClient teamTitles={teamTitles} defaultTeam={DEFAULT_TEAM} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-1">
            シュートマップ
          </h1>
          <div className="bg-white border border-gray-200 rounded p-8 text-center text-sm text-gray-500">
            データを取得できませんでした。しばらく経ってからアクセスしてください。
          </div>
        </div>
      </main>
    );
  }
}
