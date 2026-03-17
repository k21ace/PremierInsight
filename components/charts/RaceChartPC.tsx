"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  CustomTooltip,
  getAnnotation,
  type ChartPanelProps,
  type CustomTooltipProps,
} from "./chart-shared";

// ─── Legend ──────────────────────────────────────────────

interface LegendPayloadItem {
  dataKey?: string | number;
  color?: string;
}

function ChartLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  const items = (payload ?? []).filter(
    (p) => !String(p.dataKey).endsWith("_pred"),
  );
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3">
      {items.map((entry) => (
        <span
          key={String(entry.dataKey)}
          className="flex items-center gap-1.5 text-xs text-gray-600"
        >
          <svg width={14} height={4}>
            <line x1={0} y1={2} x2={14} y2={2} stroke={entry.color} strokeWidth={2} />
          </svg>
          {String(entry.dataKey)}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <svg width={14} height={4}>
          <line
            x1={0} y1={2} x2={14} y2={2}
            stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="3 2"
          />
        </svg>
        予測
      </span>
    </div>
  );
}

// ─── Custom Dot（24px エンブレム＋勝点差ラベル）──────────

interface CustomDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  actualMaxMatchday: number;
  crestUrl: string;
  teamName: string;
  stroke: string;
  annotationText: string;
  annotationColor: string;
}

function CustomDot({
  cx,
  cy,
  index,
  actualMaxMatchday,
  crestUrl,
  teamName,
  stroke,
  annotationText,
  annotationColor,
}: CustomDotProps) {
  if (index !== actualMaxMatchday - 1 || cx === undefined || cy === undefined) {
    return <g />;
  }
  const r = 12;
  const clipId = `crest-pc-${teamName}`;
  return (
    <g>
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
        href={crestUrl}
        clipPath={`url(#${clipId})`}
      />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke={stroke} strokeWidth={1} />
      {annotationText && (
        <text x={cx + r + 8} y={cy + 4} fontSize={11} fontWeight={600} fill={annotationColor}>
          {annotationText}
        </text>
      )}
    </g>
  );
}

// ─── RaceChartPC ─────────────────────────────────────────

export default function RaceChartPC({
  chartData,
  activeTimelines,
  maxMatchday,
  dramaticMoments,
  group,
  leaderFinalPoints,
  safeZoneFinalPoints,
}: ChartPanelProps) {
  return (
    <div style={{ height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 140, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="matchday"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => String(v)}
            label={{
              value: "節",
              position: "insideBottomRight",
              offset: -8,
              fontSize: 11,
              fill: "#6b7280",
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            width={40}
            domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10 + 5]}
            label={{
              value: "勝点",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              fontSize: 11,
              fill: "#6b7280",
            }}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                {...(props as unknown as CustomTooltipProps)}
                dramaticMoments={dramaticMoments}
              />
            )}
          />
          <ChartLegend />

          {/* ドラマチック瞬間ハイライト */}
          {dramaticMoments.map((moment) => (
            <ReferenceLine
              key={moment.matchday}
              x={moment.matchday}
              stroke={moment.isHeadToHead ? "#f59e0b" : "#7c3aed"}
              strokeDasharray="3 3"
              label={{
                value: moment.isHeadToHead
                  ? `第${moment.matchday}節 ⚔`
                  : `第${moment.matchday}節`,
                position: "insideTopRight",
                fontSize: 11,
                fill: "#9ca3af",
              }}
            />
          ))}

          {/* 予測ライン（点線・半透明） */}
          {activeTimelines.map((tl) => (
            <Line
              key={`${tl.teamId}_pred`}
              type="monotone"
              dataKey={`${tl.teamShortName}_pred`}
              stroke={tl.color}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              dot={false}
              activeDot={{ r: 0 }}
              legendType="none"
            />
          ))}

          {/* 実績ライン（終端24pxエンブレム＋勝点差ラベル） */}
          {activeTimelines.map((tl) => {
            const { text: annotationText, color: annotationColor } = getAnnotation(
              group,
              tl.points.at(-1) ?? 0,
              leaderFinalPoints,
              safeZoneFinalPoints,
            );
            return (
              <Line
                key={tl.teamId}
                type="monotone"
                dataKey={tl.teamShortName}
                stroke={tl.color}
                strokeWidth={2}
                dot={(props: { cx?: number; cy?: number; index?: number }) => (
                  <CustomDot
                    {...props}
                    actualMaxMatchday={maxMatchday}
                    crestUrl={tl.crestUrl}
                    teamName={tl.teamShortName}
                    stroke={tl.color}
                    annotationText={annotationText}
                    annotationColor={annotationColor}
                  />
                )}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
