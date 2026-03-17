"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Goal, Match, MatchStatus } from "@/types/football";

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

// UTC → JST 時刻（例: 22:00）
function formatTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
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

// ステータスバッジ
function StatusBadge({ status }: { status: MatchStatus }) {
  const config: Partial<Record<MatchStatus, { label: string; className: string }>> = {
    FINISHED:  { label: "終了",   className: "bg-gray-100 text-gray-600" },
    IN_PLAY:   { label: "試合中", className: "bg-green-100 text-green-700" },
    LIVE:      { label: "試合中", className: "bg-green-100 text-green-700" },
    PAUSED:    { label: "試合中", className: "bg-green-100 text-green-700" },
    SCHEDULED: { label: "予定",   className: "bg-blue-50 text-blue-600" },
    TIMED:     { label: "予定",   className: "bg-blue-50 text-blue-600" },
    POSTPONED: { label: "延期",   className: "bg-red-50 text-red-600" },
  };
  const { label, className } = config[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${className}`}>
      {label}
    </span>
  );
}

// 得点者ラベル（OG・PK付き）
function goalLabel(g: Goal): string {
  const suffix = g.type === "OWN" ? " (OG)" : g.type === "PENALTY" ? " (PK)" : "";
  const minute = g.minute != null ? ` ${g.minute}'` : "";
  return `${g.scorer.name}${suffix}${minute}`;
}

// 試合カード
function MatchCard({ match }: { match: Match }) {
  const { homeTeam, awayTeam, score, status, utcDate } = match;
  const goals = match.goals ?? [];
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "LIVE" || status === "PAUSED";

  // ホーム得点（ホームが決めたゴール + アウェイのOG）
  const homeGoals = goals.filter(
    (g) =>
      (g.team.id === homeTeam.id && g.type !== "OWN") ||
      (g.team.id === awayTeam.id && g.type === "OWN"),
  );
  // アウェイ得点（アウェイが決めたゴール + ホームのOG）
  const awayGoals = goals.filter(
    (g) =>
      (g.team.id === awayTeam.id && g.type !== "OWN") ||
      (g.team.id === homeTeam.id && g.type === "OWN"),
  );

  const linkLabel = isFinished ? "レポートを見る →" : "プレビューを見る →";

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
      {/* 時刻 + ステータス */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono tabular-nums text-gray-500">
          {formatTime(utcDate)}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* ホーム ─ スコア ─ アウェイ */}
      <div className="flex items-center gap-2">
        {/* ホーム */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-medium text-gray-900 text-right leading-tight truncate">
            {homeTeam.shortName}
          </span>
          <Image
            src={homeTeam.crest}
            alt={homeTeam.name}
            width={28}
            height={28}
            className="object-contain shrink-0"
          />
        </div>

        {/* スコア */}
        <div className="w-20 text-center shrink-0">
          {isFinished || isLive ? (
            <span className="text-2xl font-bold font-mono tabular-nums text-gray-900">
              {score.fullTime.home ?? "—"}&nbsp;–&nbsp;{score.fullTime.away ?? "—"}
            </span>
          ) : (
            <span className="text-base font-medium text-gray-400">vs</span>
          )}
        </div>

        {/* アウェイ */}
        <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
          <Image
            src={awayTeam.crest}
            alt={awayTeam.name}
            width={28}
            height={28}
            className="object-contain shrink-0"
          />
          <span className="text-sm font-medium text-gray-900 text-left leading-tight truncate">
            {awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* 得点者（試合終了時のみ） */}
      {isFinished && (homeGoals.length > 0 || awayGoals.length > 0) && (
        <div className="mt-3 flex gap-2 text-xs text-gray-400">
          <div className="flex-1 text-right space-y-0.5">
            {homeGoals.map((g, i) => (
              <p key={i}>{goalLabel(g)}</p>
            ))}
          </div>
          <div className="w-20 shrink-0" />
          <div className="flex-1 text-left space-y-0.5">
            {awayGoals.map((g, i) => (
              <p key={i}>{goalLabel(g)}</p>
            ))}
          </div>
        </div>
      )}

      {/* 詳細リンク */}
      <div className="mt-3 text-right">
        <Link
          href={`/matches/${match.id}`}
          className="text-xs text-violet-600 hover:text-violet-800 transition-colors"
        >
          {linkLabel}
        </Link>
      </div>
    </div>
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
      <div className="space-y-6">
        {grouped.map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-200">
              {formatDateHeader(dayMatches[0].utcDate)}
            </h2>
            <div className="space-y-3">
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
