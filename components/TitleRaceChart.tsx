"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface TeamOdds {
  name: string;
  shortName: string;
  crest: string;
  probability: number; // 0–100
  color: string;
}

const TEAMS: TeamOdds[] = [
  {
    name: "Arsenal FC",
    shortName: "Arsenal",
    crest: "https://crests.football-data.org/57.png",
    probability: 64,
    color: "#EF0107",
  },
  {
    name: "Manchester City FC",
    shortName: "Man City",
    crest: "https://crests.football-data.org/65.png",
    probability: 21,
    color: "#6CABDD",
  },
];

export default function TitleRaceChart() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 少し遅延させてから開始
          setTimeout(() => setStarted(true), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded p-4 space-y-4">
      <p className="text-xs text-gray-500 mb-1">📊 今シーズンの優勝確率</p>
      {TEAMS.map((team) => (
        <div key={team.name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
        ※ 残り試合数・勝点差・得失点差をもとに算出した独自推計値です
      </p>
    </div>
  );
}
