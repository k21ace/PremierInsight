import type { Metadata } from "next";
import { getMatches, getCurrentMatchday } from "@/lib/football-api";
import MatchesView from "./MatchesView";

export const metadata: Metadata = {
  title: "プレミアリーグ 試合結果・日程 2025-26 | PremierInsight",
  description:
    "プレミアリーグの最新試合結果と今後の日程。得点者・スコアをリアルタイムで確認できます。",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string }>;
}) {
  const { matchday: matchdayParam } = await searchParams;

  // matchdayParam が有効な整数なら使用、なければ現在の節を取得
  const parsed = matchdayParam ? parseInt(matchdayParam, 10) : NaN;
  const selectedMatchday = !isNaN(parsed)
    ? Math.max(1, Math.min(38, parsed))
    : await getCurrentMatchday();

  const data = await getMatches({ matchday: selectedMatchday });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          試合結果・日程
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.resultSet.first.slice(0, 4)}–{data.resultSet.last.slice(2, 4)}
          </span>
        </h1>
        <MatchesView
          matches={data.matches}
          matchday={selectedMatchday}
        />
      </div>
    </main>
  );
}
