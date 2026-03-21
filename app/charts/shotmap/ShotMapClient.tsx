"use client";

import { useState, useCallback, useEffect } from "react";
import type { UnderstatShot } from "@/lib/understat";

// ─── Constants ────────────────────────────────────────────

const RESULT_META: Record<string, { fill: string; label: string }> = {
  Goal:        { fill: "#22c55e", label: "ゴール" },
  SavedShot:   { fill: "#f59e0b", label: "セーブ" },
  MissedShots: { fill: "#ef4444", label: "枠外" },
  BlockedShot: { fill: "#94a3b8", label: "ブロック" },
  ShotOnPost:  { fill: "#a78bfa", label: "ポスト" },
  OwnGoal:     { fill: "#6b7280", label: "OG" },
};

const SITUATION_JA: Record<string, string> = {
  OpenPlay:        "オープンプレー",
  FromCorner:      "コーナーキック",
  SetPiece:        "セットプレー",
  DirectFreekick:  "直接FK",
  Penalty:         "PK",
};

// Pitch viewBox: "-4 -4 572 428" (attacking half, 52.5m×68m)
// Scale: sx=10.667px/m, sy=6.176px/m
// Coord: svgX=(shot.X-0.5)*1120  svgY=shot.Y*420
function toSvgX(x: number) { return (x - 0.5) * 1120; }
function toSvgY(y: number) { return y * 420; }
function shotR(xg: number) { return 4 + xg * 10; }

// ─── Pitch SVG ────────────────────────────────────────────

type TooltipShot = {
  shot: UnderstatShot;
  svgX: number;
  svgY: number;
};

function PitchSvg({
  shots,
  tooltip,
  onEnter,
  onLeave,
}: {
  shots: UnderstatShot[];
  tooltip: TooltipShot | null;
  onEnter: (shot: UnderstatShot, sx: number, sy: number) => void;
  onLeave: () => void;
}) {
  return (
    <svg
      viewBox="-4 -4 572 428"
      className="w-full rounded"
      style={{ background: "#2e6b3e" }}
    >
      <defs>
        {/* Clip for penalty arc: only show arc outside penalty area (x < 384) */}
        <clipPath id="arcClip">
          <rect x="-4" y="-4" width="388" height="436" />
        </clipPath>
        {/* Clip for center circle: only show right half (x >= 0) */}
        <clipPath id="centerClip">
          <rect x="0" y="-4" width="572" height="436" />
        </clipPath>
      </defs>

      {/* Field */}
      <rect x="0" y="0" width="560" height="420" fill="#2e6b3e" />

      {/* Pitch markings */}
      {/* Top touchline */}
      <line x1="0" y1="0" x2="560" y2="0" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Bottom touchline */}
      <line x1="0" y1="420" x2="560" y2="420" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Goal line */}
      <line x1="560" y1="0" x2="560" y2="420" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Center line (dashed) */}
      <line x1="0" y1="0" x2="0" y2="420" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="6 4" />

      {/* Center circle – right half (two 90° arcs to avoid 180° ambiguity) */}
      <path
        d="M 0 112.4 A 97.6 97.6 0 0 1 97.6 210 A 97.6 97.6 0 0 1 0 307.6"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        clipPath="url(#centerClip)"
      />
      <circle cx="0" cy="210" r="2.5" fill="white" fillOpacity="0.8" />

      {/* Penalty area */}
      <rect x="384" y="85.5" width="176" height="249" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />

      {/* 6-yard box */}
      <rect x="501" y="153" width="59" height="114" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Penalty spot */}
      <circle cx="442.7" cy="210" r="2.5" fill="white" fillOpacity="0.8" />

      {/* Penalty arc (only portion outside penalty area) */}
      <circle
        cx="442.7"
        cy="210"
        r="97.6"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        clipPath="url(#arcClip)"
      />

      {/* Goal */}
      <rect x="558" y="187" width="10" height="46" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Corner arcs */}
      <path d="M 549.3 0 A 10.667 10.667 0 0 0 560 10.667"  fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      <path d="M 549.3 420 A 10.667 10.667 0 0 1 560 409.333" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Shots */}
      {shots.map((shot) => {
        const sx = Math.max(2, Math.min(558, toSvgX(shot.X)));
        const sy = Math.max(2, Math.min(418, toSvgY(shot.Y)));
        const r  = shotR(shot.xG);
        const meta = RESULT_META[shot.result] ?? { fill: "#6b7280", label: "その他" };
        const isHovered = tooltip?.shot.id === shot.id;
        return (
          <circle
            key={shot.id}
            cx={sx}
            cy={sy}
            r={isHovered ? r + 2 : r}
            fill={meta.fill}
            fillOpacity={isHovered ? 1 : 0.72}
            stroke="white"
            strokeWidth={isHovered ? 1.5 : 0.8}
            onMouseEnter={() => onEnter(shot, sx, sy)}
            onMouseLeave={onLeave}
            className="cursor-pointer"
          />
        );
      })}
    </svg>
  );
}

// ─── Stats ────────────────────────────────────────────────

function Stats({ shots }: { shots: UnderstatShot[] }) {
  const goals  = shots.filter((s) => s.result === "Goal").length;
  const onTarget = shots.filter((s) => s.result === "Goal" || s.result === "SavedShot").length;
  const xG     = shots.reduce((acc, s) => acc + s.xG, 0);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { label: "シュート",   value: shots.length },
        { label: "枠内",       value: onTarget },
        { label: "ゴール",     value: goals },
        { label: "xG",         value: xG.toFixed(1) },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white border border-gray-200 rounded p-2">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-mono tabular-nums font-semibold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
      {Object.entries(RESULT_META).map(([key, { fill, label }]) => (
        <span key={key} className="flex items-center gap-1">
          <svg width="10" height="10">
            <circle cx="5" cy="5" r="4" fill={fill} />
          </svg>
          {label}
        </span>
      ))}
      <span className="flex items-center gap-1 text-gray-400">
        ● サイズ = xG
      </span>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────

function ShotTooltip({ shot }: { shot: UnderstatShot }) {
  const meta = RESULT_META[shot.result] ?? { fill: "#6b7280", label: "その他" };
  return (
    <div className="pointer-events-none absolute z-10 bg-white border border-gray-200 rounded shadow-sm px-3 py-2 text-xs space-y-0.5 w-44"
      style={{ transform: "translate(-50%, -110%)" }}
    >
      <div className="font-semibold text-gray-900">{shot.player}</div>
      <div className="flex justify-between">
        <span style={{ color: meta.fill }} className="font-medium">{meta.label}</span>
        <span className="font-mono tabular-nums text-gray-700">{shot.minute}&apos;</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>xG</span>
        <span className="font-mono tabular-nums">{shot.xG.toFixed(3)}</span>
      </div>
      <div className="text-gray-400">{SITUATION_JA[shot.situation] ?? shot.situation}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

type Filter = "all" | "h" | "a";

interface Props {
  teamTitles: string[];
  defaultTeam: string;
}

export default function ShotMapClient({ teamTitles, defaultTeam }: Props) {
  const [selectedTeam, setSelectedTeam] = useState(defaultTeam);
  const [shots, setShots]               = useState<UnderstatShot[]>([]);
  const [filter, setFilter]             = useState<Filter>("all");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [tooltip, setTooltip]           = useState<TooltipShot | null>(null);

  // マウント時にデフォルトチームのシュートを自動取得
  useEffect(() => {
    handleTeamChange(defaultTeam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamChange = useCallback(async (team: string) => {
    setSelectedTeam(team);
    setTooltip(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/understat/shots?team=${encodeURIComponent(team)}&season=2025`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as UnderstatShot[];
      setShots(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === "all" ? shots : shots.filter((s) => s.h_a === filter);

  const handleEnter = useCallback((shot: UnderstatShot, svgX: number, svgY: number) => {
    setTooltip({ shot, svgX, svgY });
  }, []);
  const handleLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedTeam}
          onChange={(e) => handleTeamChange(e.target.value)}
          disabled={loading}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-violet-600 disabled:opacity-50"
        >
          {teamTitles.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex rounded border border-gray-200 overflow-hidden text-sm">
          {(["all", "h", "a"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition-colors ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "全試合" : f === "h" ? "ホーム" : "アウェイ"}
            </button>
          ))}
        </div>

        {loading && (
          <span className="text-sm text-gray-400 animate-pulse">読み込み中…</span>
        )}
      </div>

      {error && (
        <div className="bg-white border border-gray-200 rounded p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Stats */}
      <Stats shots={filtered} />

      {/* Pitch */}
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="relative">
          <PitchSvg
            shots={filtered}
            tooltip={tooltip}
            onEnter={handleEnter}
            onLeave={handleLeave}
          />
          {/* Tooltip overlay */}
          {tooltip && (() => {
            // Convert SVG coords to percentage for positioning
            const pctX = (tooltip.svgX + 4) / 572 * 100;
            const pctY = (tooltip.svgY + 4) / 428 * 100;
            return (
              <div
                className="absolute"
                style={{ left: `${pctX}%`, top: `${pctY}%` }}
              >
                <ShotTooltip shot={tooltip.shot} />
              </div>
            );
          })()}
        </div>

        {/* Pitch label */}
        <div className="text-xs text-gray-400 text-center mt-2">
          ← センターライン　　ゴール →
        </div>
      </div>

      {/* Legend */}
      <Legend />

      {/* Note */}
      <p className="text-xs text-gray-400">
        データ提供: <a href="https://understat.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Understat</a>。
        座標はシュートを打ったチームが右方向（X=1）に攻撃するよう正規化されています。
      </p>
    </div>
  );
}
