"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Match, TeamTimeline } from "@/types/football";
import { calcDramaticEvents, calcProbabilities } from "@/lib/chart-utils";
import {
  buildChartData,
  type Group,
} from "@/components/charts/chart-shared";
import RaceChartPC from "@/components/charts/RaceChartPC";
import RaceChartSP from "@/components/charts/RaceChartSP";

// ─── Tab Config ───────────────────────────────────────────

const TAB_CONFIG: { key: Group; labelFull: string; labelShort: string; probLabel: string }[] = [
  { key: "title",      labelFull: "優勝争い（上位3チーム）", labelShort: "優勝争い",  probLabel: "優勝確率" },
  { key: "cl",         labelFull: "CL圏争い（3位〜7位）",    labelShort: "CL圏争い",  probLabel: "CL権獲得確率" },
  { key: "relegation", labelFull: "残留争い（16位〜20位）",  labelShort: "残留争い",  probLabel: "残留確率" },
];

// ─── ProbabilityBar ───────────────────────────────────────

const PROB_TOOLTIP_TEXT =
  "直近10試合の平均勝点（avgPPG）をもとに各チームの勝・引分・負の確率を推定し、残り試合を5,000回シミュレーション。各試合の結果を独立したランダム試行として扱い、最終順位の出現頻度から確率を算出しています（ドロー率は25%を想定）。";

function InfoTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors text-[10px] font-semibold leading-none"
        aria-label="確率の計算方法"
      >
        i
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 w-72 bg-white border border-gray-200 rounded shadow-sm p-3 text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">確率の計算方法</p>
          <p>{PROB_TOOLTIP_TEXT}</p>
        </div>
      )}
    </div>
  );
}

interface ProbEntry {
  teamId: number;
  teamShortName: string;
  crestUrl: string;
  color: string;
  prob: number;
}

function ProbabilityBar({ entries, label }: { entries: ProbEntry[]; label: string }) {
  const sorted = [...entries].sort((a, b) => b.prob - a.prob);
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <InfoTooltip />
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((e) => (
          <div
            key={e.teamId}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2.5 py-1.5 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.crestUrl} alt="" width={18} height={18} className="object-contain shrink-0" />
            <span className="text-xs font-medium text-gray-700">{e.teamShortName}</span>
            <span
              className="text-xs font-mono tabular-nums font-semibold"
              style={{ color: e.color }}
            >
              {(e.prob * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RaceChart ───────────────────────────────────────────

interface RaceChartProps {
  timelines: TeamTimeline[];
  matches: Match[];
  groupTeamIds: {
    title: number[];
    cl: number[];
    relegation: number[];
  };
  safeZoneTeamId: number | null;
}

export default function RaceChart({
  timelines,
  matches,
  groupTeamIds,
  safeZoneTeamId,
}: RaceChartProps) {
  const [group, setGroup] = useState<Group>("title");

  const activeTeamIds = groupTeamIds[group];
  const activeTimelines = timelines.filter((tl) =>
    activeTeamIds.includes(tl.teamId),
  );
  const maxMatchday = activeTimelines[0]?.points.length ?? 0;
  // 全チームの maxMatchday（確率計算に使用）
  const globalMaxMatchday = timelines[0]?.points.length ?? 0;

  const chartData = useMemo(
    () => buildChartData(activeTimelines, maxMatchday),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, maxMatchday],
  );

  const dramaticMoments = useMemo(
    () => calcDramaticEvents(matches, activeTeamIds, group),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, matches],
  );

  // 全20チームのモンテカルロ確率（グループ切替では再計算しない）
  const allProbabilities = useMemo(
    () => calcProbabilities(timelines, globalMaxMatchday),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalMaxMatchday],
  );

  const currentTabConfig = TAB_CONFIG.find((t) => t.key === group)!;
  const probEntries: ProbEntry[] = activeTimelines.map((tl) => {
    const p = allProbabilities.find((x) => x.teamId === tl.teamId);
    const prob = p
      ? group === "title"
        ? p.titleProb
        : group === "cl"
        ? p.clProb
        : p.survivalProb
      : 0;
    return {
      teamId: tl.teamId,
      teamShortName: tl.teamShortName,
      crestUrl: tl.crestUrl,
      color: tl.color,
      prob,
    };
  });

  const leaderFinalPoints = activeTimelines[0]?.points.at(-1) ?? 0;
  const safeZoneFinalPoints = safeZoneTeamId
    ? (timelines.find((tl) => tl.teamId === safeZoneTeamId)?.points.at(-1) ?? 0)
    : 0;

  const panelProps = {
    chartData,
    activeTimelines,
    maxMatchday,
    dramaticMoments,
    group,
    leaderFinalPoints,
    safeZoneFinalPoints,
  };

  return (
    <div>
      {/* タブ（3タブ均等幅・SP/PCラベル切り替え） */}
      <div className="flex gap-2 mb-4">
        {TAB_CONFIG.map(({ key, labelFull, labelShort }) => (
          <button
            key={key}
            onClick={() => setGroup(key)}
            className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
              group === key
                ? "bg-pn-navy text-white border-pn-navy"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="hidden md:inline">{labelFull}</span>
            <span className="md:hidden">{labelShort}</span>
          </button>
        ))}
      </div>

      {/* グラフ本体 */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        {/* 確率表示 */}
        <ProbabilityBar entries={probEntries} label={currentTabConfig.probLabel} />
        {/* PC版 */}
        <div className="hidden md:block">
          <RaceChartPC {...panelProps} />
        </div>
        {/* SP版 */}
        <div className="block md:hidden">
          <RaceChartSP {...panelProps} />
        </div>
      </div>
    </div>
  );
}
