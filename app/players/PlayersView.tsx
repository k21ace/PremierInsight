"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Scorer, ScorersResponse } from "@/types/football";
import type { PlayerSNS } from "@/lib/mock/player-sns";
import { SEASONS, DEFAULT_SEASON } from "@/lib/seasons";
import { getInitials } from "@/lib/formatting";
import { getRankBadgeClass } from "@/lib/styling";
import { SNSIcon } from "@/components/ui/SNSIcon";

type SortKey = "goals" | "assists" | "goalsPlusAssists";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "goals", label: "得点順" },
  { key: "assists", label: "アシスト順" },
  { key: "goalsPlusAssists", label: "得点+A順" },
];

interface Props {
  initialScorers: Scorer[];
  snsMap: Record<number, PlayerSNS>;
}

export default function PlayersView({ initialScorers, snsMap }: Props) {
  const [scorers, setScorers] = useState<Scorer[]>(initialScorers);
  const [selectedSeason, setSelectedSeason] = useState<number>(DEFAULT_SEASON);
  const [isLoading, setIsLoading] = useState(false);
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("goals");

  const handleSeasonChange = useCallback(async (year: number) => {
    if (year === selectedSeason) return;
    setSelectedSeason(year);
    setTeamFilter("all");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/scorers?season=${year}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScorersResponse = await res.json();
      setScorers(data.scorers);
    } catch {
      // エラー時は前のデータを維持
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeason]);

  // 全チームリストを生成（重複除去・アルファベット順）
  const teams = useMemo(() => {
    const seen = new Map<string, { id: number; name: string; shortName: string; crest: string }>();
    for (const s of scorers) {
      if (!seen.has(s.team.shortName)) seen.set(s.team.shortName, s.team);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.shortName.localeCompare(b.shortName)
    );
  }, [scorers]);

  const sorted = useMemo(() => {
    const filtered =
      teamFilter === "all"
        ? scorers
        : scorers.filter((s) => String(s.team.id) === teamFilter);

    return [...filtered].sort((a, b) => {
      if (sortKey === "goals") return (b.goals ?? 0) - (a.goals ?? 0);
      if (sortKey === "assists") return (b.assists ?? 0) - (a.assists ?? 0);
      return (b.goals + (b.assists ?? 0)) - (a.goals + (a.assists ?? 0));
    });
  }, [scorers, teamFilter, sortKey]);

  return (
    <>
      {/* フィルター・ソートバー */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* シーズン選択 */}
        <select
          value={selectedSeason}
          onChange={(e) => handleSeasonChange(Number(e.target.value))}
          disabled={isLoading}
          className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-pn-blue disabled:opacity-50"
        >
          {SEASONS.map((s) => (
            <option key={s.year} value={s.year}>
              {s.label}
            </option>
          ))}
        </select>

        {/* チームフィルター */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          disabled={isLoading}
          className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-pn-blue disabled:opacity-50"
        >
          <option value="all">全チーム</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.shortName}
            </option>
          ))}
        </select>

        {/* ソート切り替え */}
        <div className="flex border border-gray-200 rounded overflow-hidden">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                sortKey === key
                  ? "bg-pn-navy text-white font-medium"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* テーブル（ローディングオーバーレイ付き） */}
      <div className="relative">
        {/* ローディングオーバーレイ */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center rounded">
            <span className="text-sm text-gray-500">読み込み中...</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-3 py-2 text-center w-10">#</th>
                <th className="px-3 py-2 text-left">選手</th>
                <th className="px-3 py-2 text-left">クラブ</th>
                <th className="hidden md:table-cell px-3 py-2 text-left">国籍</th>
                <th className="px-3 py-2 text-center">得点</th>
                <th className="px-3 py-2 text-center">A</th>
                <th className="hidden md:table-cell px-3 py-2 text-center">出場</th>
                <th className="hidden md:table-cell px-3 py-2 text-center">得点+A</th>
                <th className="hidden md:table-cell px-3 py-2 text-center">SNS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((scorer, index) => {
                const { player, team, goals, assists, playedMatches } = scorer;
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const goalsPlusAssists = goals + (assists ?? 0);
                const sns = snsMap[player.id];

                return (
                  <tr
                    key={player.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
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

                    {/* 選手名 */}
                    <td className="px-3 py-3">
                      <Link
                        href={`/players/${player.id}`}
                        className="flex items-center gap-2.5 hover:text-pn-blue transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-pn-blue-light text-pn-navy flex items-center justify-center text-xs font-semibold shrink-0 select-none">
                          {getInitials(player.name)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-pn-blue leading-tight whitespace-nowrap transition-colors">
                          {player.name}
                        </span>
                      </Link>
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

                    {/* 国籍 */}
                    <td className="hidden md:table-cell px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {player.nationality}
                    </td>

                    {/* 得点 */}
                    <td className="px-3 py-3 text-sm font-mono tabular-nums text-center font-semibold text-gray-900">
                      {goals}
                    </td>

                    {/* アシスト */}
                    <td className="px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-700">
                      {assists ?? "—"}
                    </td>

                    {/* 出場 */}
                    <td className="hidden md:table-cell px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-600">
                      {playedMatches}
                    </td>

                    {/* 得点+A */}
                    <td className="hidden md:table-cell px-3 py-3 text-sm font-mono tabular-nums text-center text-gray-700">
                      {goalsPlusAssists}
                    </td>

                    {/* SNS */}
                    <td className="hidden md:table-cell px-3 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        {sns?.sns.map((s) => (
                          <a
                            key={s.platform}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={s.handle}
                            className="text-gray-400 hover:text-pn-blue transition-colors"
                          >
                            <SNSIcon platform={s.platform} size="sm" />
                          </a>
                        ))}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
