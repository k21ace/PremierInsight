"use client";

import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { HomeAwayStats } from "@/lib/chart-utils";

interface Props {
  stats: HomeAwayStats[];
}

function formatDiff(n: number) {
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function DiffBadge({ diff }: { diff: number }) {
  if (diff >= 0.5) {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono tabular-nums bg-green-50 text-green-700">
        +{diff.toFixed(2)}pt
      </span>
    );
  }
  if (diff <= -0.5) {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono tabular-nums bg-blue-50 text-blue-700">
        {diff.toFixed(2)}pt
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-xs font-mono tabular-nums bg-gray-100 text-gray-500">
      {diff.toFixed(2)}pt
    </span>
  );
}

function DiffCell({ diff }: { diff: number }) {
  if (diff >= 0.5) {
    return (
      <span className="font-mono tabular-nums text-green-600">
        {formatDiff(diff)}
      </span>
    );
  }
  if (diff <= -0.5) {
    return (
      <span className="font-mono tabular-nums text-blue-600">
        {formatDiff(diff)}
      </span>
    );
  }
  return (
    <span className="font-mono tabular-nums text-gray-400">
      {formatDiff(diff)}
    </span>
  );
}

export default function HomeAwayClient({ stats }: Props) {
  // セクション1 用ソート
  const homeStrong = [...stats].sort((a, b) => b.homeDiff - a.homeDiff).slice(0, 5);
  const awayStrong = [...stats].sort((a, b) => a.homeDiff - b.homeDiff).slice(0, 5);

  // セクション2 棒グラフ（ホーム勝点降順）
  const chartData = [...stats]
    .sort((a, b) => b.home.points - a.home.points)
    .map((s) => ({
      name: s.shortName,
      ホーム: s.home.points,
      アウェイ: s.away.points,
    }));

  // セクション3 テーブル（ホーム勝点降順）
  const tableData = [...stats].sort((a, b) => b.home.points - a.home.points);

  // statsMap for Tooltip lookup
  const statsMap = new Map(stats.map((s) => [s.shortName, s]));

  interface TooltipArgs {
    active?: boolean;
    payload?: Array<{ payload: { name: string } }>;
  }
  const CustomTooltip = ({ active, payload }: TooltipArgs) => {
    if (!active || !payload?.length) return null;
    const s = statsMap.get(payload[0]?.payload?.name ?? "");
    if (!s) return null;
    return (
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 text-xs min-w-[180px]">
        <p className="font-semibold text-gray-900 mb-2">{s.teamName}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <div>
            <p className="text-violet-600 font-medium mb-1">ホーム</p>
            <p className="text-gray-600">{s.home.played}試合 {s.home.won}勝{s.home.drawn}分{s.home.lost}負</p>
            <p className="text-gray-600">得{s.home.goalsFor} 失{s.home.goalsAgainst}</p>
            <p className="font-semibold text-gray-800">{s.home.points}pt (PPG {s.home.ppg.toFixed(2)})</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">アウェイ</p>
            <p className="text-gray-600">{s.away.played}試合 {s.away.won}勝{s.away.drawn}分{s.away.lost}負</p>
            <p className="text-gray-600">得{s.away.goalsFor} 失{s.away.goalsAgainst}</p>
            <p className="font-semibold text-gray-800">{s.away.points}pt (PPG {s.away.ppg.toFixed(2)})</p>
          </div>
        </div>
      </div>
    );
  };

  const customLegend = () => (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ background: "#7c3aed", width: 12, height: 12, display: "inline-block", marginRight: 4 }} />
        ホーム
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ background: "#d1d5db", width: 12, height: 12, display: "inline-block", marginRight: 4 }} />
        アウェイ
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* ─── セクション1: ホーム強豪・アウェイ強豪 TOP5 ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ホームが強いチーム */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
            <h2 className="text-sm font-semibold text-green-800">
              ホームが強いチーム TOP5
            </h2>
            <p className="text-xs text-green-600">ホームPPG − アウェイPPG が高い順</p>
          </div>
          <ul>
            {homeStrong.map((s, i) => (
              <li
                key={s.teamId}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-xs text-gray-400 font-mono tabular-nums w-4">{i + 1}</span>
                <Image src={s.crestUrl} alt={s.teamName} width={20} height={20} className="object-contain shrink-0" />
                <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">{s.shortName}</span>
                <span className="text-xs text-gray-500 font-mono tabular-nums shrink-0">
                  {s.home.points}pt
                  <span className="text-gray-300 mx-1">vs</span>
                  {s.away.points}pt
                </span>
                <DiffBadge diff={s.homeDiff} />
              </li>
            ))}
          </ul>
        </div>

        {/* アウェイが強いチーム */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
            <h2 className="text-sm font-semibold text-blue-800">
              アウェイが強いチーム TOP5
            </h2>
            <p className="text-xs text-blue-600">アウェイPPG − ホームPPG が高い順</p>
          </div>
          <ul>
            {awayStrong.map((s, i) => (
              <li
                key={s.teamId}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-xs text-gray-400 font-mono tabular-nums w-4">{i + 1}</span>
                <Image src={s.crestUrl} alt={s.teamName} width={20} height={20} className="object-contain shrink-0" />
                <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">{s.shortName}</span>
                <span className="text-xs text-gray-500 font-mono tabular-nums shrink-0">
                  {s.home.points}pt
                  <span className="text-gray-300 mx-1">vs</span>
                  {s.away.points}pt
                </span>
                <DiffBadge diff={s.homeDiff} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── セクション2: 全チーム横棒グラフ ─────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          全チーム ホーム vs アウェイ 勝点比較
        </h2>

        {/* PC */}
        <div className="hidden md:block">
          <ResponsiveContainer width="100%" height={700}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={customLegend} />
              <Bar dataKey="ホーム" fill="#7c3aed" barSize={14} radius={[0, 2, 2, 0]}>
                <LabelList dataKey="ホーム" position="right" style={{ fontSize: 10, fill: "#7c3aed" }} />
              </Bar>
              <Bar dataKey="アウェイ" fill="#d1d5db" barSize={14} radius={[0, 2, 2, 0]}>
                <LabelList dataKey="アウェイ" position="right" style={{ fontSize: 10, fill: "#9ca3af" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SP */}
        <div className="md:hidden overflow-x-auto">
          <div style={{ minWidth: 500 }}>
            <BarChart
              layout="vertical"
              width={500}
              height={600}
              data={chartData}
              margin={{ top: 4, right: 44, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                width={64}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={customLegend} />
              <Bar dataKey="ホーム" fill="#7c3aed" barSize={12} radius={[0, 2, 2, 0]}>
                <LabelList dataKey="ホーム" position="right" style={{ fontSize: 9, fill: "#7c3aed" }} />
              </Bar>
              <Bar dataKey="アウェイ" fill="#d1d5db" barSize={12} radius={[0, 2, 2, 0]}>
                <LabelList dataKey="アウェイ" position="right" style={{ fontSize: 9, fill: "#9ca3af" }} />
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>

      {/* ─── セクション3: 詳細テーブル ────────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">詳細スタッツ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">クラブ</th>
                <th className="px-2 py-2 text-center">H 試合</th>
                <th className="px-2 py-2 text-center">H 勝点</th>
                <th className="px-2 py-2 text-center hidden md:table-cell">H 得点</th>
                <th className="px-2 py-2 text-center hidden md:table-cell">H 失点</th>
                <th className="px-2 py-2 text-center">A 試合</th>
                <th className="px-2 py-2 text-center">A 勝点</th>
                <th className="px-2 py-2 text-center hidden md:table-cell">A 得点</th>
                <th className="px-2 py-2 text-center hidden md:table-cell">A 失点</th>
                <th className="px-2 py-2 text-center">差</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((s) => (
                <tr
                  key={s.teamId}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Image src={s.crestUrl} alt={s.teamName} width={18} height={18} className="object-contain shrink-0" />
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{s.shortName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700">{s.home.played}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums font-semibold text-gray-900">{s.home.points}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700 hidden md:table-cell">{s.home.goalsFor}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700 hidden md:table-cell">{s.home.goalsAgainst}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700">{s.away.played}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums font-semibold text-gray-900">{s.away.points}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700 hidden md:table-cell">{s.away.goalsFor}</td>
                  <td className="px-2 py-2.5 text-center font-mono tabular-nums text-gray-700 hidden md:table-cell">{s.away.goalsAgainst}</td>
                  <td className="px-2 py-2.5 text-center">
                    <DiffCell diff={s.homeDiff} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
