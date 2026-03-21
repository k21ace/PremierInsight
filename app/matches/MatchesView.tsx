"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { Match } from "@/types/football";
import { getTeamShortNameJa } from "@/lib/translations";

// UTC → JST 日付キー（グルーピング用）
function toJSTDateKey(utcDate: string): string {
  const jst = new Date(new Date(utcDate).getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// UTC → JST 日付ヘッダー（例: 3月15日(土)）
function formatDateHeader(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

// 日付でグルーピング
function groupByDate(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>();
  for (const match of matches) {
    const key = toJSTDateKey(match.utcDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(match);
  }
  return Array.from(map.entries());
}

// matchday でグルーピング（昇順: 古い節が先頭）
function groupByMatchday(matches: Match[]): [number, Match[]][] {
  const map = new Map<number, Match[]>();
  for (const match of matches) {
    const md = match.matchday ?? 0;
    if (!map.has(md)) map.set(md, []);
    map.get(md)!.push(match);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b);
}

// 直近の節番号を算出（IN_PLAY優先 → 最大FINISHED節）
function resolveCurrentMatchday(matches: Match[]): number {
  const inPlay = matches.find(
    (m) => m.status === "IN_PLAY" || m.status === "LIVE" || m.status === "PAUSED",
  );
  if (inPlay) return inPlay.matchday ?? 1;

  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .map((m) => m.matchday ?? 0);
  if (finished.length > 0) return Math.max(...finished);

  const scheduled = matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .map((m) => m.matchday ?? 0);
  if (scheduled.length > 0) return Math.min(...scheduled);

  return 1;
}

// 試合カード（1行レイアウト）
function MatchCard({ match }: { match: Match }) {
  const { homeTeam, awayTeam, score, status } = match;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "LIVE" || status === "PAUSED";

  const statusLabel =
    isFinished ? "終了" :
    status === "POSTPONED" ? "延期" : "予定";
  const statusClass =
    isFinished ? "text-gray-400" :
    status === "POSTPONED" ? "text-orange-500" : "text-[#00a8e8]";
  const linkLabel = isFinished ? "レポート →" : "プレビュー →";

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="flex items-center bg-white border border-gray-100 rounded px-3 py-2 hover:border-[#00a8e8] transition-colors gap-2">
        {/* ホーム（固定幅・右寄せ） */}
        <div className="flex items-center justify-end gap-1 w-[90px] flex-shrink-0">
          <div className="text-right leading-tight">
            <span className="text-xs font-medium text-gray-900 truncate block">
              {getTeamShortNameJa(homeTeam.id) ?? homeTeam.shortName}
            </span>
            <span className="text-[10px] text-gray-400 truncate block">{homeTeam.shortName}</span>
          </div>
          <Image src={homeTeam.crest} alt={homeTeam.name} width={16} height={16} className="object-contain flex-shrink-0" />
        </div>

        {/* スコア（固定幅・中央） */}
        <div className="w-[44px] text-center flex-shrink-0">
          {isFinished || isLive ? (
            <span className="font-mono font-bold text-sm text-gray-900 tabular-nums">
              {score.fullTime.home ?? "—"}-{score.fullTime.away ?? "—"}
            </span>
          ) : (
            <span className="text-xs text-gray-400">vs</span>
          )}
        </div>

        {/* アウェイ（固定幅・左寄せ） */}
        <div className="flex items-center justify-start gap-1 w-[90px] flex-shrink-0">
          <Image src={awayTeam.crest} alt={awayTeam.name} width={16} height={16} className="object-contain flex-shrink-0" />
          <div className="leading-tight">
            <span className="text-xs font-medium text-gray-900 truncate block">
              {getTeamShortNameJa(awayTeam.id) ?? awayTeam.shortName}
            </span>
            <span className="text-[10px] text-gray-400 truncate block">{awayTeam.shortName}</span>
          </div>
        </div>

        {/* 右端：ステータス＋リンク */}
        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
          <span className={`text-xs flex-shrink-0 ${statusClass}`}>{statusLabel}</span>
          <span className="text-xs text-[#00a8e8] flex-shrink-0">{linkLabel}</span>
        </div>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────

interface MatchesViewProps {
  matches: Match[];
}

export default function MatchesView({ matches }: MatchesViewProps) {
  const groupedByMatchday = groupByMatchday(matches);
  const currentMatchday = resolveCurrentMatchday(matches);

  useEffect(() => {
    const el = document.getElementById(`matchday-${currentMatchday}`);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, [currentMatchday]);

  return (
    <div className="space-y-8">
      {groupedByMatchday.map(([matchday, mdMatches]) => {
        const groupedByDate = groupByDate(mdMatches);
        return (
          <section key={matchday} id={`matchday-${matchday}`}>
            {/* 節ヘッダー */}
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="font-mono tabular-nums">第{matchday}節</span>
              <span className="flex-1 border-t border-gray-200" />
            </h2>

            {/* 日付ごとにグルーピング */}
            <div className="space-y-4">
              {groupedByDate.map(([dateKey, dayMatches]) => (
                <div key={dateKey}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                    {formatDateHeader(dayMatches[0].utcDate)}
                  </p>
                  <div className="space-y-2">
                    {dayMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
