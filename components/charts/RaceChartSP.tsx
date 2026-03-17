"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CustomTooltip,
  type ChartPanelProps,
  type CustomTooltipProps,
} from "./chart-shared";

const SP_TICKS = [1, 5, 10, 15, 20, 25, 30, 35, 38];

// ─── Custom Legend（エンブレム＋カラーライン＋チーム名）──

interface LegendEntry {
  value?: string;
  color?: string;
}

function SpLegend({
  payload,
  crestMap,
}: {
  payload?: LegendEntry[];
  crestMap: Record<string, string>;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 12px",
        justifyContent: "center",
        padding: "12px 0 0",
      }}
    >
      {(payload ?? []).filter((e) => !String(e.value).includes("_pred")).map((entry, i) => (
        <span
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#555",
          }}
        >
          {entry.value && crestMap[entry.value] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={crestMap[entry.value]}
              width={16}
              height={16}
              style={{ objectFit: "contain" }}
              alt=""
            />
          )}
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 3,
              background: entry.color,
              borderRadius: 2,
            }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

// ─── RaceChartSP ─────────────────────────────────────────

export default function RaceChartSP({
  chartData,
  activeTimelines,
  dramaticMoments,
}: ChartPanelProps) {
  // activeTimelines から TLA → crestUrl のマップを構築
  const crestMap: Record<string, string> = {};
  activeTimelines.forEach((tl) => {
    crestMap[tl.teamShortName] = tl.crestUrl;
  });

  return (
    <div style={{ height: 440 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="matchday"
            ticks={SP_TICKS}
            tick={{ fontSize: 10 }}
            tickFormatter={(v: number) => String(v)}
            label={{
              value: "節",
              position: "insideBottomRight",
              offset: -4,
              fontSize: 10,
              fill: "#6b7280",
            }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            width={28}
            domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10 + 5]}
            label={{ value: "" }}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                {...(props as unknown as CustomTooltipProps)}
                dramaticMoments={dramaticMoments}
              />
            )}
          />
          <Legend
            verticalAlign="bottom"
            height={72}
            content={(props) => (
              <SpLegend
                payload={props.payload as LegendEntry[]}
                crestMap={crestMap}
              />
            )}
          />

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

          {/* 実績ライン */}
          {activeTimelines.map((tl) => (
            <Line
              key={tl.teamId}
              type="monotone"
              dataKey={tl.teamShortName}
              name={tl.teamShortName}
              stroke={tl.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: tl.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
