"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { TeamXgStats, UnderstatPlayer } from "@/lib/understat";

// ─── InfoTooltip ──────────────────────────────────────────

function InfoTooltip({ title, body }: { title: string; body: string }) {
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
        className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 transition-colors text-[10px] font-semibold leading-none"
        aria-label={title}
      >
        i
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</p>
          <p>{body}</p>
        </div>
      )}
    </div>
  );
}

// ─── Bar Chart Tooltip ────────────────────────────────────

interface BarTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const xg = payload.find((p) => p.name === "xG（期待得点）")?.value ?? 0;
  const scored = payload.find((p) => p.name === "実得点")?.value ?? 0;
  const diff = Math.round((scored - xg) * 10) / 10;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00a8e8] inline-block" />
            <span className="text-gray-500 dark:text-gray-400">xG</span>
          </span>
          <span className="font-mono tabular-nums">{xg}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2d0a4e] inline-block" />
            <span className="text-gray-500 dark:text-gray-400">実得点</span>
          </span>
          <span className="font-mono tabular-nums">{scored}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400">差分</span>
          <span
            className={`font-mono tabular-nums font-semibold ${
              diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Scatter Tooltip ──────────────────────────────────────

interface ScatterTooltipProps {
  active?: boolean;
  payload?: { payload: TeamXgStats }[];
}

function ScatterTooltip({ active, payload }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{d.teamName}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">xG</span>
          <span className="font-mono tabular-nums">{d.xG}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">実得点</span>
          <span className="font-mono tabular-nums">{d.scored}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400">差分</span>
          <span
            className={`font-mono tabular-nums font-semibold ${
              d.xGDiff > 0 ? "text-green-600" : d.xGDiff < 0 ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {d.xGDiff > 0 ? `+${d.xGDiff}` : d.xGDiff}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Scatter Dot（決定力で色分け）────────────────────────

interface ScatterDotProps {
  cx?: number;
  cy?: number;
  payload?: TeamXgStats;
}

function ScatterDot({ cx, cy, payload }: ScatterDotProps) {
  if (cx === undefined || cy === undefined || !payload) return <g />;
  const color = payload.xGDiff > 0 ? "#10b981" : payload.xGDiff < 0 ? "#ef4444" : "#6b7280";
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.8} stroke="white" strokeWidth={1.5} />
      <text x={cx + 8} y={cy + 4} fontSize={9} fill="#6b7280">{payload.teamName.replace(" FC", "").replace(" City", "C.").replace(" United", "Utd").replace("Manchester", "Man").replace("Brighton & Hove Albion", "Brighton").replace("Wolverhampton Wanderers", "Wolves").replace("Nottingham Forest", "N.Forest").replace("AFC Bournemouth", "Bournemouth").replace("Tottenham Hotspur", "Spurs")}</text>
    </g>
  );
}

// ─── XgClient ─────────────────────────────────────────────

interface Props {
  teamStats: TeamXgStats[];
  players: UnderstatPlayer[];
}

export default function XgClient({ teamStats, players }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";

  // 散布図の参照線（y=x の範囲）
  const maxVal = Math.max(...teamStats.map((t) => Math.max(t.xG, t.scored))) + 5;

  // プレイヤーtop20 (xG降順)
  const topPlayers = [...players]
    .sort((a, b) => parseFloat(b.xG) - parseFloat(a.xG))
    .slice(0, 20);

  // バーチャート用データ（チーム名を短縮）
  const barData = teamStats.map((t) => ({
    name: t.teamName
      .replace(" FC", "")
      .replace("Manchester", "Man")
      .replace("Brighton & Hove Albion", "Brighton")
      .replace("Wolverhampton Wanderers", "Wolves")
      .replace("Nottingham Forest", "N.Forest")
      .replace("AFC Bournemouth", "Bournemouth")
      .replace("Tottenham Hotspur", "Spurs"),
    "xG（期待得点）": t.xG,
    実得点: t.scored,
    _full: t.teamName,
    xGDiff: t.xGDiff,
  }));

  return (
    <div className="space-y-6">

      {/* セクション1: チーム別xGバーチャート */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          チーム別 xG vs 実得点
        </h2>
        <div style={{ height: 560 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={barData}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 10, fill: axisColor }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: axisColor }}
                width={80}
              />
              <Tooltip content={(props) => <BarTooltip {...(props as unknown as BarTooltipProps)} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => (
                  <span style={{ color: isDark ? "#9ca3af" : "#374151" }}>{value}</span>
                )}
              />
              <Bar dataKey="xG（期待得点）" fill="#00a8e8" barSize={8} />
              <Bar dataKey="実得点" fill="#2d0a4e" barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* セクション2: xG vs 実得点 散布図 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          xG vs 実得点（決定力分析）
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          <span className="text-green-600 font-medium">●</span> 対角線より上 = 決定力高い
          <span className="text-red-500 font-medium">●</span> 対角線より下 = 決定力低い
        </p>
        <div style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                type="number"
                dataKey="xG"
                domain={[0, maxVal]}
                tick={{ fontSize: 10, fill: axisColor }}
                label={{ value: "xG（期待得点）", position: "insideBottomRight", offset: -4, fontSize: 10, fill: axisColor }}
              />
              <YAxis
                type="number"
                dataKey="scored"
                domain={[0, maxVal]}
                tick={{ fontSize: 10, fill: axisColor }}
                width={32}
                label={{ value: "実得点", angle: -90, position: "insideLeft", offset: 8, fontSize: 10, fill: axisColor }}
              />
              {/* y=x 対角線 */}
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]}
                stroke="#d1d5db"
                strokeDasharray="4 4"
              />
              <Tooltip content={(props) => <ScatterTooltip {...(props as unknown as ScatterTooltipProps)} />} />
              <Scatter
                data={teamStats}
                shape={(props: ScatterDotProps) => <ScatterDot {...props} />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* セクション3: 選手別xGランキング TOP20 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">選手別 xG ランキング TOP20</h2>
          <InfoTooltip
            title="xG（Expected Goals）とは？"
            body="xG（Expected Goals・ゴール期待値）とは、シュートが得点になる確率を数値化したものです。シュートの位置・角度・状況などをもとに算出され、チームや選手の本来の実力を測る指標として使われています。実得点がxGより高いと「決定力が高い」、低いと「決定力が低い」と解釈されます。"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-left">
                <th className="px-3 py-2 font-medium w-8">#</th>
                <th className="px-3 py-2 font-medium">選手名</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell">チーム</th>
                <th className="px-3 py-2 font-medium text-right">xG</th>
                <th className="px-3 py-2 font-medium text-right">実得点</th>
                <th className="px-3 py-2 font-medium text-right">差分</th>
                <th className="px-3 py-2 font-medium text-right hidden sm:table-cell">npxG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {topPlayers.map((p, i) => {
                const xg = parseFloat(p.xG);
                const goals = parseInt(p.goals);
                const npxg = parseFloat(p.npxG);
                const diff = Math.round((goals - xg) * 10) / 10;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 font-mono tabular-nums text-gray-400 dark:text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{p.player_name}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {p.team_title.replace(" FC", "")}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-right text-[#00a8e8] font-semibold">
                      {xg.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-right text-gray-700 dark:text-gray-300">{goals}</td>
                    <td className={`px-3 py-2 font-mono tabular-nums text-right font-semibold ${
                      diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {npxg.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* セクション4: 選手別xAランキング TOP20 */}
      {(() => {
        const topXaPlayers = [...players]
          .sort((a, b) => parseFloat(b.xA) - parseFloat(a.xA))
          .slice(0, 20);
        return (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">選手別 xA ランキング TOP20</h2>
              <InfoTooltip
                title="xA（Expected Assists）とは？"
                body="xA（Expected Assists・アシスト期待値）とは、放たれたシュートのxGをもとに、そのシュートにつながったパスの価値を数値化したものです。KP（Key Passes・チャンス創出数）の多い選手でも、xAが低ければ質の低いチャンスしか作れていないことを示します。実アシスト数がxAより高いと「アシスト効率が高い」、低いと「運に恵まれていない」と解釈できます。"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-left">
                    <th className="px-3 py-2 font-medium w-8">#</th>
                    <th className="px-3 py-2 font-medium">選手名</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">チーム</th>
                    <th className="px-3 py-2 font-medium text-right">xA</th>
                    <th className="px-3 py-2 font-medium text-right">実アシスト</th>
                    <th className="px-3 py-2 font-medium text-right">差分</th>
                    <th className="px-3 py-2 font-medium text-right hidden sm:table-cell">KP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {topXaPlayers.map((p, i) => {
                    const xa = parseFloat(p.xA);
                    const assists = parseInt(p.assists);
                    const kp = parseInt(p.key_passes);
                    const diff = Math.round((assists - xa) * 10) / 10;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 py-2 font-mono tabular-nums text-gray-400 dark:text-gray-500">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{p.player_name}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {p.team_title.replace(" FC", "")}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right text-violet-600 font-semibold">
                          {xa.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right text-gray-700 dark:text-gray-300">{assists}</td>
                        <td className={`px-3 py-2 font-mono tabular-nums text-right font-semibold ${
                          diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {kp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}


    </div>
  );
}
