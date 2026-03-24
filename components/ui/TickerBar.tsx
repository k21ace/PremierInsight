"use client";

import Link from "next/link";
import type { Match } from "@/types/football";

type TickerMatch = Pick<Match, "id" | "homeTeam" | "awayTeam" | "score">;

interface TickerBarProps {
  matches: TickerMatch[];
}

// アイテム1個あたりの想定幅(px)。この値でアニメーション時間を決定し速度を一定に保つ
const PX_PER_ITEM = 160;
const SPEED_PX_PER_SEC = 60;

export default function TickerBar({ matches }: TickerBarProps) {
  if (matches.length === 0) return null;

  // 2倍に複製してシームレスなループを実現
  const items = [...matches, ...matches];

  // コンテンツの半分（元の配列分）の幅に応じてdurationを計算 → 常に同じpx/sで動く
  const duration = (matches.length * PX_PER_ITEM) / SPEED_PX_PER_SEC;

  return (
    <div className="overflow-hidden bg-[#240840] border-b border-[#3a2a6a] h-8 flex items-center">
      <div
        className="flex will-change-transform"
        style={{ animation: `ticker ${duration}s linear infinite` }}
      >
        {items.map((match, i) => (
          <span
            key={`${match.id}-${i}`}
            className="inline-flex items-center gap-1.5 px-5 text-xs whitespace-nowrap"
          >
            {match.homeTeam.crest && (
              <img
                src={match.homeTeam.crest}
                alt=""
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
              />
            )}
            <span className="text-[#9aa5c4]">{match.homeTeam.shortName}</span>
            <Link
              href={`/matches/${match.id}`}
              className="font-mono tabular-nums font-bold text-white hover:text-[#00a8e8] transition-colors"
            >
              {match.score.fullTime.home} - {match.score.fullTime.away}
            </Link>
            <span className="text-[#9aa5c4]">{match.awayTeam.shortName}</span>
            {match.awayTeam.crest && (
              <img
                src={match.awayTeam.crest}
                alt=""
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
              />
            )}
            <span className="text-[#3a2a6a] mx-1 select-none" aria-hidden>|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
