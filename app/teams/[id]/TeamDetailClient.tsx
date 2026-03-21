"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import type { Standing } from "@/types/football";
import { ResultBadge } from "@/components/ui/ResultBadge";
import { formatGD } from "@/lib/formatting";
import { getTeamNameJa, getTeamShortNameJa, getPlayerNameJa } from "@/lib/translations";
import type { TeamXgStats } from "@/lib/understat";
import type { TeamProbabilities } from "@/lib/chart-utils";
import type { TopPlayer } from "./page";

export interface MatchSummary {
  id: number;
  utcDate: string;
  matchday: number;
  isHome: boolean;
  opponentId: number;
  opponentName: string;
  opponentShortName: string;
  opponentCrest: string;
  scored: number;
  conceded: number;
  result: "W" | "D" | "L";
}

interface Props {
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  totalStanding: Standing;
  homeStanding: Standing | null;
  awayStanding: Standing | null;
  recentMatches: MatchSummary[];
  venue: string | null;
  coachName: string | null;
  teamXgStats: TeamXgStats | null;
  teamProbabilities: TeamProbabilities | null;
  topScorers: TopPlayer[];
  topAssisters: TopPlayer[];
}

function formatDate(utcDate: string) {
  const d = new Date(utcDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ProbBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mt-1.5">
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function TeamDetailClient({
  team,
  totalStanding,
  homeStanding,
  awayStanding,
  recentMatches,
  venue,
  coachName,
  teamXgStats,
  teamProbabilities,
  topScorers,
  topAssisters,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";

  const chartData = recentMatches.map((m) => ({
    matchday: m.matchday,
    goalsFor: m.scored,
    goalsAgainst: m.conceded,
    result: m.result,
    opponent: getTeamShortNameJa(m.opponentId) ?? m.opponentShortName,
    isHome: m.isHome,
  }));

  const played = totalStanding.playedGames;

  const homePPG =
    homeStanding && homeStanding.playedGames > 0
      ? homeStanding.points / homeStanding.playedGames
      : null;
  const awayPPG =
    awayStanding && awayStanding.playedGames > 0
      ? awayStanding.points / awayStanding.playedGames
      : null;
  const homeWinRate =
    homeStanding && homeStanding.playedGames > 0
      ? Math.round((homeStanding.won / homeStanding.playedGames) * 100)
      : null;
  const awayWinRate =
    awayStanding && awayStanding.playedGames > 0
      ? Math.round((awayStanding.won / awayStanding.playedGames) * 100)
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

      {/* ─── チームヘッダー ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
        <div className="flex items-center gap-4">
          {/* エンブレム */}
          <Image
            src={team.crest}
            alt={team.name}
            width={64}
            height={64}
            className="object-contain shrink-0"
          />

          {/* チーム名 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {getTeamNameJa(team.id) ?? team.name}
            </h1>
            {getTeamNameJa(team.id) && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{team.name}</p>
            )}
          </div>
        </div>

        {/* 監督・スタジアム */}
        {(coachName || venue) && (
          <div className="flex flex-col gap-1 mt-3">
            {coachName && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">監督</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {coachName}
                </span>
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-400 dark:text-gray-500">🏟</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {venue}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── トレンドグラフ ───────────────────────────────────────── */}
      {recentMatches.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            直近{recentMatches.length}試合のトレンド
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 12, left: -24, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="matchday"
                tickFormatter={(v) => `第${v}節`}
                tick={{ fontSize: 11, fill: axisColor }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: axisColor }}
                allowDecimals={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const d = payload[0].payload;
                  const resultColor =
                    d.result === "W" ? "#16a34a" : d.result === "D" ? "#ca8a04" : "#dc2626";
                  return (
                    <div
                      style={{
                        fontSize: 12,
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: 4,
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        color: isDark ? "#f1f5f9" : "#111827",
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ marginBottom: 4, fontWeight: 600 }}>
                        第{d.matchday}節　{d.isHome ? "H" : "A"}
                        <span style={{ marginLeft: 6, color: resultColor, fontWeight: 700 }}>
                          {d.result}
                        </span>
                        <span style={{ marginLeft: 6, fontWeight: 400 }}>vs {d.opponent}</span>
                      </div>
                      <div style={{ color: "#3b82f6" }}>得点: {d.goalsFor}</div>
                      <div style={{ color: "#ef4444" }}>失点: {d.goalsAgainst}</div>
                    </div>
                  );
                }}
              />
              <Legend
                content={() => (
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      justifyContent: "center",
                      fontSize: 12,
                      color: isDark ? "#9ca3af" : undefined,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 24, height: 2, background: "#3b82f6", display: "inline-block" }} />
                      得点
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 24, height: 2, background: "#ef4444", display: "inline-block" }} />
                      失点
                    </span>
                  </div>
                )}
              />
              <Line
                type="monotone"
                dataKey="goalsFor"
                name="得点"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="goalsAgainst"
                name="失点"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── 確率予測 ────────────────────────────────────────────── */}
      {teamProbabilities && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            確率予測
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">優勝確率</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-violet-600">
                {(teamProbabilities.titleProb * 100).toFixed(1)}%
              </div>
              <ProbBar value={teamProbabilities.titleProb} color="#7c3aed" />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">UCL出場確率</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-violet-600">
                {(teamProbabilities.clProb * 100).toFixed(1)}%
              </div>
              <ProbBar value={teamProbabilities.clProb} color="#7c3aed" />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">残留確率</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-violet-600">
                {(teamProbabilities.survivalProb * 100).toFixed(1)}%
              </div>
              <ProbBar value={teamProbabilities.survivalProb} color="#7c3aed" />
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            ※ 直近の平均勝点をもとにしたモンテカルロシミュレーションによる推定値
          </p>
        </div>
      )}

      {/* ─── xG 分析 ─────────────────────────────────────────────── */}
      {teamXgStats && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            xG 分析
            <span className="ml-2 text-xs font-normal text-gray-400">Understat</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            期待得点（xG）と実際の得点の比較。差がプラスなら決定力が高い。
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                攻撃
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">期待得点 (xG)</span>
                  <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                    {teamXgStats.xG}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">実際の得点</span>
                  <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                    {teamXgStats.scored}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">xG との差</span>
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      teamXgStats.xGDiff >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {teamXgStats.xGDiff >= 0 ? "+" : ""}{teamXgStats.xGDiff}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                守備
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">期待失点 (xGA)</span>
                  <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                    {teamXgStats.xGA}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">実際の失点</span>
                  <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                    {teamXgStats.missed}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">xGA との差</span>
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      teamXgStats.xGADiff >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {teamXgStats.xGADiff >= 0 ? "+" : ""}{teamXgStats.xGADiff}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 攻撃スタイル ────────────────────────────────────────── */}
      {played > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            攻撃スタイル分析
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 h-8 flex items-center justify-center">試合あたり得点</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
                {(totalStanding.goalsFor / played).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 h-8 flex items-center justify-center">試合あたり失点</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
                {(totalStanding.goalsAgainst / played).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 h-8 flex flex-col items-center justify-center leading-tight">
                <span>勝点/試合</span>
                <span>(PPG)</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-violet-600">
                {(totalStanding.points / played).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ホーム/アウェイ成績比較 ─────────────────────────────── */}
      {(homeStanding || awayStanding) && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ホーム / アウェイ 成績比較
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {homeStanding && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded p-4">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
                  ホーム
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">試合数</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {homeStanding.playedGames}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">勝率</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {homeWinRate !== null ? `${homeWinRate}%` : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">勝点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {homePPG !== null ? homePPG.toFixed(2) : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">得点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {homeStanding.playedGames > 0
                        ? (homeStanding.goalsFor / homeStanding.playedGames).toFixed(2)
                        : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">失点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {homeStanding.playedGames > 0
                        ? (homeStanding.goalsAgainst / homeStanding.playedGames).toFixed(2)
                        : "–"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {awayStanding && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded p-4">
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wider">
                  アウェイ
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">試合数</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {awayStanding.playedGames}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">勝率</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {awayWinRate !== null ? `${awayWinRate}%` : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">勝点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {awayPPG !== null ? awayPPG.toFixed(2) : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">得点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {awayStanding.playedGames > 0
                        ? (awayStanding.goalsFor / awayStanding.playedGames).toFixed(2)
                        : "–"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">失点/試合</span>
                    <span className="font-mono tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                      {awayStanding.playedGames > 0
                        ? (awayStanding.goalsAgainst / awayStanding.playedGames).toFixed(2)
                        : "–"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {homePPG !== null && awayPPG !== null && (
            <div className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
              ホーム/アウェイ PPG 差：
              <span
                className={`font-mono tabular-nums font-semibold ml-1 ${
                  homePPG - awayPPG >= 0.5
                    ? "text-blue-600"
                    : awayPPG - homePPG >= 0.5
                    ? "text-orange-600"
                    : "text-gray-500"
                }`}
              >
                {homePPG - awayPPG >= 0 ? "+" : ""}{(homePPG - awayPPG).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── チーム内 得点・アシスト Top3 ────────────────────────── */}
      {(topScorers.length > 0 || topAssisters.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topScorers.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  チーム内 得点ランキング
                </h2>
              </div>
              <ul>
                {topScorers.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-sm font-mono tabular-nums text-gray-400 dark:text-gray-500 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
                      {getPlayerNameJa(p.name) ?? p.name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-violet-600 text-base shrink-0">
                      {p.count}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">G</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {topAssisters.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  チーム内 アシストランキング
                </h2>
              </div>
              <ul>
                {topAssisters.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-sm font-mono tabular-nums text-gray-400 dark:text-gray-500 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
                      {getPlayerNameJa(p.name) ?? p.name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-violet-600 text-base shrink-0">
                      {p.count}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">A</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ─── 直近の試合結果 ───────────────────────────────────────── */}
      {recentMatches.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              直近の試合結果
            </h2>
          </div>
          <ul>
            {[...recentMatches].reverse().map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-xs text-gray-400 dark:text-gray-500 w-10 shrink-0 font-mono tabular-nums">
                  {formatDate(m.utcDate)}
                </span>
                <ResultBadge result={m.result} />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-6 shrink-0">
                  {m.isHome ? "H" : "A"}
                </span>
                <Image
                  src={m.opponentCrest}
                  alt={m.opponentName}
                  width={20}
                  height={20}
                  className="object-contain shrink-0"
                />
                <div className="flex-1 min-w-0 leading-tight">
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate block">
                    {getTeamShortNameJa(m.opponentId) ?? m.opponentShortName}
                  </span>
                  {getTeamShortNameJa(m.opponentId) && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                      {m.opponentShortName}
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                  {m.scored}
                  <span className="text-gray-400 dark:text-gray-500 mx-1">–</span>
                  {m.conceded}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
