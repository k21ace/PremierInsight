"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Match } from "@/types/football";

const MAX_MATCHDAY = 38;

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
          <span className="text-xs font-medium text-gray-900 truncate">
            {homeTeam.shortName}
          </span>
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
          <span className="text-xs font-medium text-gray-900 truncate">
            {awayTeam.shortName}
          </span>
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
  matchday: number;
}

export default function MatchesView({ matches, matchday }: MatchesViewProps) {
  const router = useRouter();
  const grouped = groupByDate(matches);

  return (
    <div>
      {/* 節切り替えナビ */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/matches?matchday=${matchday - 1}`)}
          disabled={matchday <= 1}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="前の節"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-gray-900 w-16 text-center">
          第&thinsp;<span className="font-mono tabular-nums">{matchday}</span>&thinsp;節
        </span>
        <button
          onClick={() => router.push(`/matches?matchday=${matchday + 1}`)}
          disabled={matchday >= MAX_MATCHDAY}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="次の節"
        >
          →
        </button>
      </div>

      {/* 試合なし */}
      {grouped.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-12">
          この節の試合情報がありません。
        </p>
      )}

      {/* 日付ごとにグルーピング */}
      <div className="space-y-4">
        {grouped.map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-200">
              {formatDateHeader(dayMatches[0].utcDate)}
            </h2>
            <div className="space-y-2">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
