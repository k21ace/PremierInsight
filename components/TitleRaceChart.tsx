"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import type { TeamTimeline } from "@/types/football";
import { calcProbabilities } from "@/lib/chart-utils";

interface TitleRaceChartProps {
  timelines: TeamTimeline[];
}

interface TeamEntry {
  teamId: number;
  shortName: string;
  crest: string;
  probability: number;
  color: string;
}

interface SectionProps {
  label: string;
  teams: TeamEntry[];
  started: boolean;
  link?: string;
}

function ProbSection({ label, teams, started, link }: SectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</p>
        {link && <Link href={link} className="text-xs text-[#00a8e8] hover:underline">詳細を見る →</Link>}
      </div>
      {teams.map((team) => (
        <div key={team.teamId} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={team.crest} alt={team.shortName} className="w-4 h-4 object-contain flex-shrink-0" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{team.shortName}</span>
            </div>
            <span
              className="text-xs font-bold font-mono tabular-nums"
              style={{ color: team.color }}
            >
              {started ? team.probability : 0}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
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
    </div>
  );
}

export default function TitleRaceChart({ timelines }: TitleRaceChartProps) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const maxMatchday = timelines[0]?.points.length ?? 0;

  const { titleTeams, clTeams, survivalTeams } = useMemo(() => {
    const probs = calcProbabilities(timelines, maxMatchday);

    const toEntry = (teamId: number, prob: number): TeamEntry | null => {
      const tl = timelines.find((t) => t.teamId === teamId);
      if (!tl) return null;
      return {
        teamId: tl.teamId,
        shortName: tl.teamShortName,
        crest: tl.crestUrl,
        probability: Math.round(prob * 100),
        color: tl.color,
      };
    };

    const title = probs
      .map((p) => toEntry(p.teamId, p.titleProb))
      .filter((t): t is TeamEntry => t !== null && t.probability >= 1)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    const cl = probs
      .map((p) => toEntry(p.teamId, p.clProb))
      .filter((t): t is TeamEntry => t !== null && t.probability >= 1 && t.probability < 100)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    const survival = probs
      .map((p) => toEntry(p.teamId, p.survivalProb))
      .filter((t): t is TeamEntry => t !== null && t.probability < 100)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    return { titleTeams: title, clTeams: cl, survivalTeams: survival };
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

  if (titleTeams.length === 0) {
    return (
      <div>
        <p className="text-xs text-gray-400">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      <ProbSection label="優勝確率" teams={titleTeams} started={started} link="/charts/race" />
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <ProbSection label="CL圏出場確率" teams={clTeams} started={started} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <ProbSection label="残留確率" teams={survivalTeams} started={started} />
      </div>

      <p className="text-[10px] text-gray-400">
        ※ 直近10試合の平均勝点をもとにモンテカルロシミュレーション（5,000回）で算出した推計値です
      </p>
    </div>
  );
}
