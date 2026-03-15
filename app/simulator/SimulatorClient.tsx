"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  calcSimulation,
  type SimulatorMatch,
} from "@/lib/simulator-utils";
import type { Standing } from "@/types/football";

interface Props {
  standings: Standing[];
  allMatches: SimulatorMatch[];
  displayMatchdays: number[];
}

function getZoneBorder(position: number): string {
  if (position <= 4) return "border-l-4 border-blue-500";
  if (position === 5) return "border-l-4 border-orange-400";
  if (position === 6) return "border-l-4 border-orange-200";
  if (position >= 18) return "border-l-4 border-red-500";
  return "border-l-4 border-transparent";
}

type Prediction = "H" | "D" | "A";

const BTN_STYLES: Record<Prediction, string> = {
  H: "bg-green-500 text-white",
  D: "bg-gray-400 text-white",
  A: "bg-blue-500 text-white",
};

export default function SimulatorClient({
  standings,
  allMatches,
  displayMatchdays,
}: Props) {
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );

  const matchesWithPredictions = useMemo(
    () =>
      allMatches.map((m) => ({
        ...m,
        prediction: predictions[m.matchId] ?? null,
      })),
    [allMatches, predictions],
  );

  const displayMatches = useMemo(
    () =>
      matchesWithPredictions.filter((m) =>
        displayMatchdays.includes(m.matchday),
      ),
    [matchesWithPredictions, displayMatchdays],
  );

  const simResults = useMemo(
    () => calcSimulation(standings, matchesWithPredictions),
    [standings, matchesWithPredictions],
  );

  const hasPredictions = Object.keys(predictions).length > 0;
  const totalPredictions = Object.keys(predictions).length;
  const totalDisplayMatches = displayMatches.length;

  // 節ごとにグループ化
  const groupedMatches = useMemo(() => {
    const groups = new Map<number, SimulatorMatch[]>();
    for (const m of displayMatches) {
      if (!groups.has(m.matchday)) groups.set(m.matchday, []);
      groups.get(m.matchday)!.push(m);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [displayMatches]);

  function togglePrediction(matchId: number, result: Prediction) {
    setPredictions((prev) => {
      if (prev[matchId] === result) {
        const next = { ...prev };
        delete next[matchId];
        return next;
      }
      return { ...prev, [matchId]: result };
    });
  }

  // サマリー用
  const mostGained = hasPredictions
    ? simResults.reduce((best, r) =>
        r.predictedPoints - r.currentPoints >
        best.predictedPoints - best.currentPoints
          ? r
          : best,
      )
    : null;
  const biggestRise = hasPredictions
    ? simResults.reduce((best, r) =>
        r.positionChange > best.positionChange ? r : best,
      )
    : null;
  const biggestFall = hasPredictions
    ? simResults.reduce((best, r) =>
        r.positionChange < best.positionChange ? r : best,
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ─── セクション1: ヘッダー ─────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-gray-500">
            残り試合の結果を予測して最終順位をシミュレーションしましょう。
          </p>
        </div>
        <button
          onClick={() => setPredictions({})}
          className="shrink-0 px-3 py-1.5 text-xs border border-gray-200 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          リセット
        </button>
      </div>

      {/* ─── セクション2+3: 2カラムレイアウト ──────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* 左: 試合予測入力 */}
        <div className="w-full md:w-5/12 space-y-3">
          {groupedMatches.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-center text-sm text-gray-400">
              予定試合データがありません
            </div>
          ) : (
            groupedMatches.map(([matchday, matches]) => (
              <div
                key={matchday}
                className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden"
              >
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500">
                    第{matchday}節
                  </span>
                </div>
                <ul>
                  {matches.map((m) => {
                    const pred = predictions[m.matchId];
                    return (
                      <li
                        key={m.matchId}
                        className="px-3 py-2.5 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-1.5">
                          {/* ホームチーム */}
                          <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                            <span className="text-xs text-gray-800 truncate">
                              {m.homeTeamShortName}
                            </span>
                            <Image
                              src={m.homeTeamCrest}
                              alt={m.homeTeamShortName}
                              width={18}
                              height={18}
                              className="object-contain shrink-0"
                            />
                          </div>
                          {/* H/D/A ボタン */}
                          <div className="flex gap-1 shrink-0">
                            {(["H", "D", "A"] as const).map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  togglePrediction(m.matchId, opt)
                                }
                                className={`w-7 h-7 text-xs font-bold rounded transition-colors ${
                                  pred === opt
                                    ? BTN_STYLES[opt]
                                    : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {/* アウェイチーム */}
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Image
                              src={m.awayTeamCrest}
                              alt={m.awayTeamShortName}
                              width={18}
                              height={18}
                              className="object-contain shrink-0"
                            />
                            <span className="text-xs text-gray-800 truncate">
                              {m.awayTeamShortName}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* 右: 予測順位表 */}
        <div className="w-full md:w-7/12">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                予測順位表
              </h2>
              {!hasPredictions && (
                <span className="text-xs text-gray-400">
                  試合結果を予測すると、順位表がリアルタイムで更新されます
                </span>
              )}
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider">
                  <th className="px-2 py-2 text-center w-7">#</th>
                  <th className="px-2 py-2 text-center w-8">変動</th>
                  <th className="px-2 py-2 text-left">クラブ</th>
                  <th className="px-2 py-2 text-center">現在</th>
                  <th className="px-2 py-2 text-center">予測</th>
                  <th className="px-2 py-2 text-center hidden sm:table-cell">
                    残試合
                  </th>
                </tr>
              </thead>
              <tbody>
                {simResults.map((r) => (
                  <tr
                    key={r.teamId}
                    className={`border-b border-gray-100 last:border-0 transition-colors ${
                      hasPredictions && r.positionChange !== 0
                        ? "bg-violet-50/30"
                        : "hover:bg-gray-50"
                    } ${getZoneBorder(r.predictedPosition)}`}
                  >
                    {/* 予測順位 */}
                    <td className="px-2 py-2 text-center font-mono tabular-nums text-gray-500">
                      {r.predictedPosition}
                    </td>
                    {/* 変動 */}
                    <td className="px-2 py-2 text-center font-mono tabular-nums">
                      {!hasPredictions || r.positionChange === 0 ? (
                        <span className="text-gray-300">→</span>
                      ) : r.positionChange > 0 ? (
                        <span className="text-green-600">
                          ↑{r.positionChange}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          ↓{Math.abs(r.positionChange)}
                        </span>
                      )}
                    </td>
                    {/* クラブ */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <Image
                          src={r.crestUrl}
                          alt={r.teamName}
                          width={16}
                          height={16}
                          className="object-contain shrink-0"
                        />
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {r.shortName}
                        </span>
                      </div>
                    </td>
                    {/* 現在勝点 */}
                    <td className="px-2 py-2 text-center font-mono tabular-nums text-gray-400">
                      {r.currentPoints}
                    </td>
                    {/* 予測勝点 */}
                    <td className="px-2 py-2 text-center font-mono tabular-nums font-semibold text-gray-900">
                      {r.predictedPoints}
                      {r.predictedPoints > r.currentPoints && (
                        <span className="text-green-600 text-xs ml-0.5">
                          +{r.predictedPoints - r.currentPoints}
                        </span>
                      )}
                    </td>
                    {/* 残試合 */}
                    <td className="px-2 py-2 text-center font-mono tabular-nums text-gray-400 hidden sm:table-cell">
                      {r.remainingMatches}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── セクション4: 予測サマリー ────────────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          予測サマリー
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 入力済み */}
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-gray-500 mb-1">予測入力</p>
            <p className="font-mono tabular-nums font-semibold text-gray-900 text-base">
              {totalPredictions}
              <span className="text-gray-400 font-normal text-xs">
                /{totalDisplayMatches}試合
              </span>
            </p>
          </div>
          {/* 最も勝点が増えるチーム */}
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-gray-500 mb-1">最多獲得</p>
            {mostGained && mostGained.predictedPoints > mostGained.currentPoints ? (
              <>
                <p className="font-medium text-gray-900 truncate">
                  {mostGained.shortName}
                </p>
                <p className="font-mono tabular-nums text-green-600">
                  +{mostGained.predictedPoints - mostGained.currentPoints}pt
                </p>
              </>
            ) : (
              <p className="text-gray-300">—</p>
            )}
          </div>
          {/* 最大上昇 */}
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-gray-500 mb-1">最大上昇</p>
            {biggestRise && biggestRise.positionChange > 0 ? (
              <>
                <p className="font-medium text-gray-900 truncate">
                  {biggestRise.shortName}
                </p>
                <p className="font-mono tabular-nums text-green-600">
                  ↑{biggestRise.positionChange}位
                </p>
              </>
            ) : (
              <p className="text-gray-300">—</p>
            )}
          </div>
          {/* 最大下降 */}
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-gray-500 mb-1">最大下降</p>
            {biggestFall && biggestFall.positionChange < 0 ? (
              <>
                <p className="font-medium text-gray-900 truncate">
                  {biggestFall.shortName}
                </p>
                <p className="font-mono tabular-nums text-red-500">
                  ↓{Math.abs(biggestFall.positionChange)}位
                </p>
              </>
            ) : (
              <p className="text-gray-300">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
