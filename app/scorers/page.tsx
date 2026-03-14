import type { Metadata } from "next";
import Image from "next/image";
import { getScorers } from "@/lib/football-api";
import type { Scorer } from "@/types/football";

export const metadata: Metadata = {
  title: "プレミアリーグ 得点王ランキング 2025-26 | PremierInsight",
  description:
    "プレミアリーグの得点王・アシストランキング。最新のゴール数・アシスト数をランキング形式で確認できます。",
};

// 順位バッジのクラス（1〜3位のみ）
function getRankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-amber-400 text-white";
  if (rank === 2) return "bg-gray-300 text-gray-600";
  if (rank === 3) return "bg-amber-700 text-white";
  return "";
}

// 名前からイニシャル2文字を生成（例: "Erling Haaland" → "EH"）
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ScorerRow({ scorer, rank }: { scorer: Scorer; rank: number }) {
  const { player, team, goals, assists, playedMatches } = scorer;
  const isTop3 = rank <= 3;
  const goalsPlusAssists = goals + (assists ?? 0);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* 順位 */}
      <td className="px-3 py-3 w-10 text-center">
        {isTop3 ? (
          <span
            className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-sm ${getRankBadgeClass(rank)}`}
          >
            {rank}
          </span>
        ) : (
          <span className="text-sm font-mono tabular-nums text-gray-500">
            {rank}
          </span>
        )}
      </td>

      {/* 選手名（イニシャルアバター + 氏名） */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-semibold shrink-0 select-none">
            {getInitials(player.name)}
          </div>
          <span className="text-sm font-medium text-gray-900 leading-tight">
            {player.name}
          </span>
        </div>
      </td>

      {/* クラブ */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Image
            src={team.crest}
            alt={team.name}
            width={20}
            height={20}
            className="object-contain shrink-0"
          />
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {team.shortName}
          </span>
        </div>
      </td>

      {/* 試合（スマホ非表示） */}
      <td className="hidden md:table-cell px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-600">
        {playedMatches}
      </td>

      {/* 得点 */}
      <td className="px-3 py-3 text-sm font-mono tabular-nums text-center font-semibold text-gray-900">
        {goals}
      </td>

      {/* アシスト */}
      <td className="px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-700">
        {assists ?? "—"}
      </td>

      {/* 得点+A（スマホ非表示） */}
      <td className="hidden md:table-cell px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-700">
        {goalsPlusAssists}
      </td>
    </tr>
  );
}

export default async function ScorersPage() {
  const data = await getScorers();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          得点王ランキング
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.season.startDate.slice(0, 4)}–{data.season.endDate.slice(2, 4)}
          </span>
        </h1>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-3 py-2 text-center w-10">#</th>
                <th className="px-3 py-2 text-left">選手</th>
                <th className="px-3 py-2 text-left">クラブ</th>
                <th className="hidden md:table-cell px-3 py-2 text-center">
                  試合
                </th>
                <th className="px-3 py-2 text-center">得点</th>
                <th className="px-3 py-2 text-center">A</th>
                <th className="hidden md:table-cell px-3 py-2 text-center">
                  得点+A
                </th>
              </tr>
            </thead>
            <tbody>
              {data.scorers.map((scorer, index) => (
                <ScorerRow
                  key={scorer.player.id}
                  scorer={scorer}
                  rank={index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
