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
import type { Standing } from "@/types/football";
import { ResultBadge } from "@/components/ui/ResultBadge";
import { formatGD } from "@/lib/formatting";

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
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold font-mono tabular-nums text-gray-900">
        {value}
      </div>
    </div>
  );
}

function formatDate(utcDate: string) {
  const d = new Date(utcDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TeamDetailClient({
  team,
  totalStanding,
  homeStanding,
  awayStanding,
  recentMatches,
}: Props) {
  const chartData = recentMatches.map((m) => ({
    matchday: m.matchday,
    goalsFor: m.scored,
    goalsAgainst: m.conceded,
    result: m.result,
  }));

  const totalGD = totalStanding.goalDifference;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ─── セクション1: チームヘッダー ──────────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
        <div className="flex items-center gap-4">
          <Image
            src={team.crest}
            alt={team.name}
            width={64}
            height={64}
            className="object-contain shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500">{team.tla}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
          <StatCard label="順位" value={`${totalStanding.position}位`} />
          <StatCard label="勝点" value={totalStanding.points} />
          <StatCard label="得点" value={totalStanding.goalsFor} />
          <StatCard label="失点" value={totalStanding.goalsAgainst} />
          <StatCard label="得失点差" value={formatGD(totalGD)} />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3 text-center text-sm">
          <div>
            <span className="text-gray-500 text-xs">勝</span>
            <span className="ml-1 font-mono tabular-nums font-semibold text-gray-900">
              {totalStanding.won}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">分</span>
            <span className="ml-1 font-mono tabular-nums font-semibold text-gray-900">
              {totalStanding.draw}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">負</span>
            <span className="ml-1 font-mono tabular-nums font-semibold text-gray-900">
              {totalStanding.lost}
            </span>
          </div>
        </div>
      </div>

      {/* ─── セクション2: 直近試合トレンドグラフ ──── */}
      {recentMatches.length > 0 && (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            直近{recentMatches.length}試合のトレンド
          </h2>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 12, left: -24, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="matchday"
                tickFormatter={(v) => `第${v}節`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                angle={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                allowDecimals={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                }}
              />
              <Legend
                content={() => (
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12 }}>
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

      {/* ─── セクション3: 直近試合リスト ──────────── */}
      {recentMatches.length > 0 && (
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              直近の試合結果
            </h2>
          </div>
          <ul>
            {[...recentMatches].reverse().map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 w-10 shrink-0 font-mono tabular-nums">
                  {formatDate(m.utcDate)}
                </span>
                <ResultBadge result={m.result} />
                <span className="text-xs text-gray-500 w-6 shrink-0">
                  {m.isHome ? "H" : "A"}
                </span>
                <Image
                  src={m.opponentCrest}
                  alt={m.opponentName}
                  width={20}
                  height={20}
                  className="object-contain shrink-0"
                />
                <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
                  {m.opponentShortName}
                </span>
                <span className="font-mono tabular-nums text-sm font-semibold text-gray-900 shrink-0">
                  {m.scored}
                  <span className="text-gray-400 mx-1">–</span>
                  {m.conceded}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── セクション4: ホーム/アウェイ成績 ─────── */}
      {(homeStanding || awayStanding) && (
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              今シーズン通算スタッツ
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">区分</th>
                  <th className="px-3 py-2 text-center">試</th>
                  <th className="px-3 py-2 text-center">勝</th>
                  <th className="px-3 py-2 text-center">分</th>
                  <th className="px-3 py-2 text-center">負</th>
                  <th className="px-3 py-2 text-center">得</th>
                  <th className="px-3 py-2 text-center">失</th>
                  <th className="px-3 py-2 text-center">差</th>
                  <th className="px-3 py-2 text-center">勝点</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "トータル", s: totalStanding },
                  { label: "ホーム", s: homeStanding },
                  { label: "アウェイ", s: awayStanding },
                ].map(({ label, s }) =>
                  s ? (
                    <tr
                      key={label}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-700">
                        {label}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.playedGames}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.won}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.draw}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.lost}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.goalsFor}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {s.goalsAgainst}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-gray-700">
                        {formatGD(s.goalDifference)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums font-semibold text-gray-900">
                        {s.points}
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
