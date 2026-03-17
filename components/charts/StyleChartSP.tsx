"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { TeamStyle } from "@/lib/chart-utils";

// ─── Custom Tooltip（PC版と共通） ─────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { payload: TeamStyle }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-3 text-xs min-w-[150px]">
      <p className="font-semibold text-gray-900 mb-1.5">{d.teamName}</p>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">得点</span>
          <span className="font-mono tabular-nums">{d.goalsFor}点</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">失点</span>
          <span className="font-mono tabular-nums">{d.goalsAgainst}点</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">勝点</span>
          <span className="font-mono tabular-nums">{d.points}pt</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">平均</span>
          <span className="font-mono tabular-nums">{d.ppg.toFixed(2)} pt/試合</span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Dot（18px エンブレム・ホバーで22px）─────────

interface CrestDotProps {
  cx?: number;
  cy?: number;
  payload?: TeamStyle;
}

function CrestDot({ cx, cy, payload }: CrestDotProps) {
  const [hovered, setHovered] = useState(false);
  if (cx === undefined || cy === undefined || !payload) return <g />;

  const r = hovered ? 11 : 9;
  const clipId = `style-sp-${payload.teamId}`;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <image
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        href={payload.crestUrl}
        clipPath={`url(#${clipId})`}
      />
      {/* clip 外 +1px に白縁を描いて重なっても区別できるようにする */}
      <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="white" strokeWidth={2} />
    </g>
  );
}

// ─── StyleChartSP ─────────────────────────────────────────

interface StyleChartSPProps {
  teamStyles: TeamStyle[];
}

const MARGIN = { top: 20, right: 40, bottom: 40, left: 10 };

export default function StyleChartSP({ teamStyles }: StyleChartSPProps) {
  if (teamStyles.length === 0) return null;

  const gfValues = teamStyles.map((t) => t.goalsFor);
  const gaValues = teamStyles.map((t) => t.goalsAgainst);
  const minGF = Math.min(...gfValues);
  const maxGF = Math.max(...gfValues);
  const avgGF = Math.round(gfValues.reduce((a, b) => a + b, 0) / gfValues.length);
  const avgGA = Math.round(gaValues.reduce((a, b) => a + b, 0) / gaValues.length);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">
        ※ 縦軸は上に行くほど失点が少ない（守備が良い）
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="goalsFor"
            domain={[Math.max(0, minGF - 5), maxGF + 5]}
            tick={{ fontSize: 10 }}
            label={{
              value: "得点",
              position: "insideBottomRight",
              offset: -4,
              fontSize: 10,
              fill: "#6b7280",
            }}
          />
          <YAxis
            type="number"
            dataKey="goalsAgainst"
            reversed
            domain={['dataMin - 3', 'dataMax + 3']}
            tick={{ fontSize: 10 }}
            width={30}
            label={{
              value: "失点",
              angle: -90,
              position: "insideLeft",
              dx: -5,
              fontSize: 10,
              fill: "#6b7280",
            }}
          />
          <ReferenceLine x={avgGF} stroke="#e5e7eb" strokeDasharray="4 4" />
          <ReferenceLine y={avgGA} stroke="#e5e7eb" strokeDasharray="4 4" />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                active={props.active}
                payload={props.payload as unknown as { payload: TeamStyle }[]}
              />
            )}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            data={teamStyles}
            shape={(props: CrestDotProps) => <CrestDot {...props} />}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
