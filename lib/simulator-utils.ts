import type { Match, Standing } from "@/types/football";

// ─── 型定義 ────────────────────────────────────────────────

export type SimulatorMatch = {
  matchId: number;
  matchday: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamShortName: string;
  homeTeamCrest: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamShortName: string;
  awayTeamCrest: string;
  prediction: "H" | "D" | "A" | null;
};

export type TeamSimResult = {
  teamId: number;
  teamName: string;
  shortName: string;
  crestUrl: string;
  currentPoints: number;
  predictedPoints: number;
  currentPosition: number;
  predictedPosition: number;
  /** 順位変動（プラスなら上昇） */
  positionChange: number;
  remainingMatches: number;
};

// ─── ユーティリティ ────────────────────────────────────────

/** Match → SimulatorMatch 変換（prediction: null で初期化） */
export function matchToSimulator(match: Match): SimulatorMatch {
  return {
    matchId: match.id,
    matchday: match.matchday,
    homeTeamId: match.homeTeam.id,
    homeTeamName: match.homeTeam.name,
    homeTeamShortName: match.homeTeam.shortName,
    homeTeamCrest: match.homeTeam.crest,
    awayTeamId: match.awayTeam.id,
    awayTeamName: match.awayTeam.name,
    awayTeamShortName: match.awayTeam.shortName,
    awayTeamCrest: match.awayTeam.crest,
    prediction: null,
  };
}

/**
 * 予測結果をもとに各チームの勝点・予測順位を計算して返す。
 * prediction が null の試合は無視する。
 *
 * @param standings  現在の順位表（TOTAL）
 * @param matches    SimulatorMatch[]（表示中の全試合）
 */
export function calcSimulation(
  standings: Standing[],
  matches: SimulatorMatch[],
): TeamSimResult[] {
  // 残り試合数を集計
  const remainingMap = new Map<number, number>();
  for (const m of matches) {
    remainingMap.set(m.homeTeamId, (remainingMap.get(m.homeTeamId) ?? 0) + 1);
    remainingMap.set(m.awayTeamId, (remainingMap.get(m.awayTeamId) ?? 0) + 1);
  }

  // 予測結果から加算勝点を計算
  const addedPoints = new Map<number, number>();
  for (const m of matches) {
    if (!m.prediction) continue;
    if (m.prediction === "H") {
      addedPoints.set(m.homeTeamId, (addedPoints.get(m.homeTeamId) ?? 0) + 3);
    } else if (m.prediction === "D") {
      addedPoints.set(m.homeTeamId, (addedPoints.get(m.homeTeamId) ?? 0) + 1);
      addedPoints.set(m.awayTeamId, (addedPoints.get(m.awayTeamId) ?? 0) + 1);
    } else {
      addedPoints.set(m.awayTeamId, (addedPoints.get(m.awayTeamId) ?? 0) + 3);
    }
  }

  // 各チームの結果を構築
  const results: TeamSimResult[] = standings.map((s) => ({
    teamId: s.team.id,
    teamName: s.team.name,
    shortName: s.team.shortName,
    crestUrl: s.team.crest,
    currentPoints: s.points,
    predictedPoints: s.points + (addedPoints.get(s.team.id) ?? 0),
    currentPosition: s.position,
    predictedPosition: 0,
    positionChange: 0,
    remainingMatches: remainingMap.get(s.team.id) ?? 0,
  }));

  // 予測勝点で降順ソートし、予測順位・変動を付与
  results.sort((a, b) => b.predictedPoints - a.predictedPoints);
  results.forEach((r, i) => {
    r.predictedPosition = i + 1;
    r.positionChange = r.currentPosition - r.predictedPosition;
  });

  return results;
}
