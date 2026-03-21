"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import type { TeamTimeline } from "@/types/football";
import { calcProbabilities } from "@/lib/chart-utils";

interface TitleRaceChartProps {
  timelines: TeamTimeline[];
}

export default function TitleRaceChart({ timelines }: TitleRaceChartProps) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const maxMatchday = timelines[0]?.points.length ?? 0;

  const teams = useMemo(() => {
    const probs = calcProbabilities(timelines, maxMatchday);
    return probs
      .map((p) => {
        const tl = timelines.find((t) => t.teamId === p.teamId)!;
        return {
          teamId: tl.teamId,
          shortName: tl.teamShortName,
          crest: tl.crestUrl,
          probability: Math.round(p.titleProb * 100),
          color: tl.color,
        };
      })
      .filter((t) => t.probability >= 1)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }, [timelines, maxMatchday]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (teams.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-4">
        <p className="text-xs text-gray-400">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">📊 今シーズンの優勝確率</p>
        <Link href="/charts/race" className="text-xs text-[#00a8e8] hover:underline">
          詳細を見る →
        </Link>
      </div>
      {teams.map((team) => (
        <div key={team.teamId} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={team.crest} alt={team.shortName} className="w-5 h-5 object-contain" />
              <span className="text-sm font-medium text-gray-800">{team.shortName}</span>
            </div>
            <span
              className="text-sm font-bold font-mono tabular-nums"
              style={{ color: team.color }}
            >
              {started ? team.probability : 0}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded"
              style={{
                width: started ? `${team.probability}%` : "0%",
                backgroundColor: team.color,
                transition: started ? "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
              }}
            />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-400 pt-1">
        ※ 直近10試合の平均勝点をもとにモンテカルロシミュレーション（5,000回）で算出した推計値です
      </p>
    </div>
  );
}
