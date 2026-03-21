import type { HomeAwayTable, Match, Standing, TeamTimeline } from "@/types/football";
import { getTeamColor } from "./team-colors";

// ─── HomeAwayStats ─────────────────────────────────────────

export interface HomeAwayStatEntry {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  winRate: number;
  ppg: number;
}

export interface HomeAwayStats {
  teamId: number;
  teamName: string;
  shortName: string;
  crestUrl: string;
  home: HomeAwayStatEntry;
  away: HomeAwayStatEntry;
  /** ホームPPG − アウェイPPG（プラスならホーム強） */
  homeDiff: number;
}

function toEntry(s: HomeAwayTable): HomeAwayStatEntry {
  const ppg = s.playedGames > 0
    ? Math.round((s.points / s.playedGames) * 100) / 100
    : 0;
  const winRate = s.playedGames > 0
    ? Math.round((s.won / s.playedGames) * 100)
    : 0;
  return {
    played: s.playedGames,
    won: s.won,
    drawn: s.draw,
    lost: s.lost,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    points: s.points,
    winRate,
    ppg,
  };
}

/**
 * HOME / AWAY の順位表データからホーム・アウェイ別スタッツを算出する。
 * getHomeAwayStandings() の戻り値をそのまま渡す。
 */
export function calcHomeAwayStats(
  homeTable: HomeAwayTable[],
  awayTable: HomeAwayTable[],
): HomeAwayStats[] {
  const awayMap = new Map(awayTable.map((s) => [s.team.id, s]));
  return homeTable.map((h) => {
    const a = awayMap.get(h.team.id);
    const home = toEntry(h);
    const away = a
      ? toEntry(a)
      : { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, winRate: 0, ppg: 0 };
    const homeDiff = Math.round((home.ppg - away.ppg) * 100) / 100;
    return {
      teamId: h.team.id,
      teamName: h.team.name,
      shortName: h.team.shortName,
      crestUrl: h.team.crest,
      home,
      away,
      homeDiff,
    };
  });
}

// ─── TeamStyle ────────────────────────────────────────────

export interface TeamStyle {
  teamId: number;
  teamName: string;
  shortName: string;
  crestUrl: string;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  played: number;
  ppg: number;
}

/**
 * 順位表データから各チームの攻撃力・守備力スタイルを算出する。
 * ScatterChart の散布図データとして使用する。
 */
export function calcTeamStyles(standings: Standing[]): TeamStyle[] {
  return standings.map((s) => ({
    teamId: s.team.id,
    teamName: s.team.name,
    shortName: s.team.shortName,
    crestUrl: s.team.crest,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    points: s.points,
    played: s.playedGames,
    ppg: s.playedGames > 0 ? s.points / s.playedGames : 0,
  }));
}

const TOTAL_MATCHDAYS = 38;

/** ドラマチックな瞬間（首位交代・大幅順位変動・直接対決） */
export interface DramaticMoment {
  matchday: number;
  description: string;
  isHeadToHead?: boolean;
}

/**
 * 終了済み試合データから各チームの節ごとの勝点推移を計算する。
 *
 * - 試合未消化の節（ブランクGW）は前節の勝点を引き継ぐ
 * - 直近5節の avgPPG から38節まで予測勝点を計算する
 * - 返り値は最終勝点の降順でソート済み
 */
export function calcPointsTimeline(matches: Match[]): TeamTimeline[] {
  if (matches.length === 0) return [];

  // 全チームを収集
  const teamsMap = new Map<number, { id: number; name: string; shortName: string; tla: string; crest: string }>();
  for (const m of matches) {
    teamsMap.set(m.homeTeam.id, m.homeTeam);
    teamsMap.set(m.awayTeam.id, m.awayTeam);
  }

  // matchday でグループ化
  const byMatchday = new Map<number, Match[]>();
  for (const m of matches) {
    if (!byMatchday.has(m.matchday)) byMatchday.set(m.matchday, []);
    byMatchday.get(m.matchday)!.push(m);
  }

  const maxMatchday = Math.max(...matches.map((m) => m.matchday));
  const timelines: TeamTimeline[] = [];

  for (const [teamId, team] of teamsMap) {
    let cumulative = 0;
    const points: number[] = [];

    for (let day = 1; day <= maxMatchday; day++) {
      const dayMatches = byMatchday.get(day) ?? [];
      const match = dayMatches.find(
        (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId,
      );
      if (match) {
        const isHome = match.homeTeam.id === teamId;
        const home = match.score.fullTime.home ?? 0;
        const away = match.score.fullTime.away ?? 0;
        if (home === away) {
          cumulative += 1;
        } else if ((isHome && home > away) || (!isHome && away > home)) {
          cumulative += 3;
        }
      }
      points.push(cumulative);
    }

    // avgPPG: 直近10節のデルタ平均
    const last10Deltas: number[] = [];
    for (let i = Math.max(1, points.length - 10); i < points.length; i++) {
      last10Deltas.push(points[i] - points[i - 1]);
    }
    const avgPPG =
      last10Deltas.length > 0
        ? last10Deltas.reduce((a, b) => a + b, 0) / last10Deltas.length
        : 1;

    // predictedPoints: 現在節（index 0）〜38節
    const currentPoints = points[points.length - 1];
    const remaining = TOTAL_MATCHDAYS - maxMatchday;
    const predictedPoints: number[] = [currentPoints];
    for (let i = 1; i <= remaining; i++) {
      predictedPoints.push(Math.round(currentPoints + avgPPG * i));
    }

    timelines.push({
      teamId,
      teamName: team.name,
      teamShortName: team.tla,
      color: getTeamColor(teamId),
      crestUrl: team.crest,
      points,
      avgPPG,
      predictedPoints,
    });
  }

  return timelines.sort((a, b) => (b.points.at(-1) ?? 0) - (a.points.at(-1) ?? 0));
}

/**
 * タイムラインから「ドラマチックな瞬間」を検出する。
 * - 首位が交代した節
 * - 1節で3位以上の順位変動があったチームがいる節
 * 最大3件を重篤度の高い順で返す。
 */
export function detectDramaticMoments(timelines: TeamTimeline[]): DramaticMoment[] {
  if (timelines.length < 2) return [];

  const maxMatchday = timelines[0].points.length;
  const scored: (DramaticMoment & { severity: number })[] = [];

  let prevRanks: Record<number, number> = {};
  let prevLeaderId: number | null = null;

  for (let day = 1; day <= maxMatchday; day++) {
    const standings = timelines
      .map((tl) => ({ teamId: tl.teamId, teamShortName: tl.teamShortName, points: tl.points[day - 1] }))
      .sort((a, b) => b.points - a.points);

    const currentRanks: Record<number, number> = {};
    standings.forEach((s, i) => { currentRanks[s.teamId] = i + 1; });

    const currentLeaderId = standings[0].teamId;

    if (day >= 2) {
      // 首位交代
      if (prevLeaderId !== null && currentLeaderId !== prevLeaderId) {
        const newLeader = timelines.find((tl) => tl.teamId === currentLeaderId);
        scored.push({
          matchday: day,
          description: `${newLeader?.teamShortName ?? "?"} 首位浮上`,
          severity: 3,
        });
      }

      // 3位以上の順位変動
      for (const tl of timelines) {
        const prev = prevRanks[tl.teamId] ?? 0;
        const curr = currentRanks[tl.teamId] ?? 0;
        if (prev === 0) continue;
        const swing = prev - curr; // 正 = 順位上昇
        if (Math.abs(swing) >= 3) {
          scored.push({
            matchday: day,
            description: `${tl.teamShortName} ${swing > 0 ? "▲" : "▼"}${Math.abs(swing)}位`,
            severity: Math.abs(swing),
          });
        }
      }
    }

    prevRanks = currentRanks;
    prevLeaderId = currentLeaderId;
  }

  // matchday ごとに最大重篤度のものを1件にまとめ、上位3件を返す
  const byMatchday = new Map<number, (typeof scored)[0]>();
  for (const m of scored) {
    const existing = byMatchday.get(m.matchday);
    if (!existing || existing.severity < m.severity) {
      byMatchday.set(m.matchday, m);
    }
  }

  return [...byMatchday.values()]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map(({ matchday, description }) => ({ matchday, description }));
}

/**
 * タブのグループに応じたドラマチックイベントを検出して返す。
 *
 * 検出ルール（グループ別）:
 * - title:      グループ内1位交代・上位2チームの直接対決・グループ内2位以上順位変動
 * - cl:         CL圏（7位以内）への入出・グループ内直接対決・グループ内2位以上順位変動
 * - relegation: 降格圏（18位以下）への入出・グループ内直接対決・グループ内2位以上順位変動
 *
 * @returns DramaticMoment[] 最大3件、重篤度の高い順
 */
export function calcDramaticEvents(
  matches: Match[],
  targetTeamIds: number[],
  eventType: "title" | "cl" | "relegation",
): DramaticMoment[] {
  if (matches.length === 0 || targetTeamIds.length < 2) return [];

  // ── 全チームの節ごと累計勝点を構築 ──────────────────────────
  const allTeamIds = new Set<number>();
  const teamTlaMap = new Map<number, string>();
  const matchesByDay = new Map<number, Match[]>();

  for (const m of matches) {
    allTeamIds.add(m.homeTeam.id);
    allTeamIds.add(m.awayTeam.id);
    teamTlaMap.set(m.homeTeam.id, m.homeTeam.tla);
    teamTlaMap.set(m.awayTeam.id, m.awayTeam.tla);
    if (!matchesByDay.has(m.matchday)) matchesByDay.set(m.matchday, []);
    matchesByDay.get(m.matchday)!.push(m);
  }

  const maxDay = Math.max(...matches.map((m) => m.matchday));

  // teamId -> 節ごと累計勝点配列（index = day-1）
  const cumPts = new Map<number, number[]>();
  for (const teamId of allTeamIds) {
    let cum = 0;
    const pts: number[] = [];
    for (let day = 1; day <= maxDay; day++) {
      const match = (matchesByDay.get(day) ?? []).find(
        (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId,
      );
      if (match) {
        const isHome = match.homeTeam.id === teamId;
        const home = match.score.fullTime.home ?? 0;
        const away = match.score.fullTime.away ?? 0;
        if (home === away) cum += 1;
        else if ((isHome && home > away) || (!isHome && away > home)) cum += 3;
      }
      pts.push(cum);
    }
    cumPts.set(teamId, pts);
  }

  const targetSet = new Set(targetTeamIds);
  const events: (DramaticMoment & { severity: number })[] = [];

  // ── 節ごとの順位変動・ゾーン変化を検出 ──────────────────────
  const prevGroupRanks = new Map<number, number>();
  const prevGlobalRanks = new Map<number, number>();
  let prevGroupLeaderId: number | null = null;

  for (let day = 1; day <= maxDay; day++) {
    // 全体順位（降格圏・CL圏判定用）
    const globalOrder = [...allTeamIds]
      .map((id) => ({ id, pts: cumPts.get(id)![day - 1] }))
      .sort((a, b) => b.pts - a.pts);
    const globalRanks = new Map(globalOrder.map((s, i) => [s.id, i + 1]));

    // グループ内順位
    const groupOrder = targetTeamIds
      .map((id) => ({ id, pts: cumPts.get(id)?.[day - 1] ?? 0 }))
      .sort((a, b) => b.pts - a.pts);
    const groupRanks = new Map(groupOrder.map((s, i) => [s.id, i + 1]));

    if (day >= 2) {
      const groupLeaderId = groupOrder[0].id;

      // グループ内首位交代（title のみ）
      if (eventType === "title" && prevGroupLeaderId !== null && groupLeaderId !== prevGroupLeaderId) {
        const tla = teamTlaMap.get(groupLeaderId) ?? "?";
        events.push({ matchday: day, description: `${tla} 首位浮上`, severity: 3 });
      }

      // グループ内2位以上順位変動
      for (const id of targetTeamIds) {
        const prev = prevGroupRanks.get(id) ?? 0;
        const curr = groupRanks.get(id) ?? 0;
        if (prev === 0 || curr === 0) continue;
        const swing = prev - curr; // 正 = 上昇
        if (Math.abs(swing) >= 2) {
          const tla = teamTlaMap.get(id) ?? "?";
          events.push({
            matchday: day,
            description: `${tla} ${swing > 0 ? "▲" : "▼"}${Math.abs(swing)}位`,
            severity: Math.abs(swing),
          });
        }
      }

      // CL圏への入出（cl のみ）
      if (eventType === "cl") {
        for (const id of targetTeamIds) {
          const prev = prevGlobalRanks.get(id) ?? 0;
          const curr = globalRanks.get(id) ?? 0;
          if (prev === 0 || curr === 0) continue;
          const tla = teamTlaMap.get(id) ?? "?";
          if (prev <= 7 && curr > 7) {
            events.push({ matchday: day, description: `${tla} CL圏外転落`, severity: 3 });
          } else if (prev > 7 && curr <= 7) {
            events.push({ matchday: day, description: `${tla} CL圏内浮上`, severity: 3 });
          }
        }
      }

      // 降格圏への入出（relegation のみ）
      if (eventType === "relegation") {
        for (const id of targetTeamIds) {
          const prev = prevGlobalRanks.get(id) ?? 0;
          const curr = globalRanks.get(id) ?? 0;
          if (prev === 0 || curr === 0) continue;
          const tla = teamTlaMap.get(id) ?? "?";
          if (prev < 18 && curr >= 18) {
            events.push({ matchday: day, description: `${tla} 降格圏入り`, severity: 3 });
          } else if (prev >= 18 && curr < 18) {
            events.push({ matchday: day, description: `${tla} 降格圏脱出`, severity: 3 });
          }
        }
      }
    }

    prevGroupLeaderId = groupOrder[0].id;
    for (const [id, rank] of groupRanks) prevGroupRanks.set(id, rank);
    for (const [id, rank] of globalRanks) prevGlobalRanks.set(id, rank);
  }

  // ── グループ内直接対決を検出 ──────────────────────────────────
  let directMatches = matches.filter(
    (m) => targetSet.has(m.homeTeam.id) && targetSet.has(m.awayTeam.id),
  );

  if (eventType === "title") {
    // title: グループ内最終上位2チーム間のみ
    const sortedIds = [...targetTeamIds].sort(
      (a, b) => (cumPts.get(b)?.at(-1) ?? 0) - (cumPts.get(a)?.at(-1) ?? 0),
    );
    const top2 = new Set(sortedIds.slice(0, 2));
    directMatches = directMatches.filter(
      (m) => top2.has(m.homeTeam.id) && top2.has(m.awayTeam.id),
    );
  }

  const directMoments: (DramaticMoment & { severity: number })[] = directMatches
    .sort((a, b) => a.matchday - b.matchday)
    .slice(0, 2)
    .map((m) => {
      const home = m.score.fullTime.home ?? 0;
      const away = m.score.fullTime.away ?? 0;
      const homeTla = teamTlaMap.get(m.homeTeam.id) ?? "?";
      const awayTla = teamTlaMap.get(m.awayTeam.id) ?? "?";
      return {
        matchday: m.matchday,
        description: `${homeTla} vs ${awayTla} (${home}–${away})`,
        severity: 4,
        isHeadToHead: true,
      };
    });

  // ── 重複除去・上位3件を返す ───────────────────────────────────
  const h2hDays = new Set(directMoments.map((m) => m.matchday));
  const combined = [...directMoments, ...events.filter((m) => !h2hDays.has(m.matchday))];

  const dedupByDay = new Map<number, (typeof combined)[0]>();
  for (const m of combined) {
    const existing = dedupByDay.get(m.matchday);
    if (!existing || existing.severity < m.severity) dedupByDay.set(m.matchday, m);
  }

  return [...dedupByDay.values()]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map(({ matchday, description, isHeadToHead }) => ({ matchday, description, isHeadToHead }));
}

// ─── Probability Simulation ────────────────────────────────

export interface TeamProbabilities {
  teamId: number;
  /** 最終順位1位になる確率 */
  titleProb: number;
  /** 最終順位5位以内に入る確率 */
  clProb: number;
  /** 最終順位17位以上になる確率（降格圏外） */
  survivalProb: number;
}

/**
 * モンテカルロシミュレーションで各チームの確率を推定する。
 *
 * 各チームの avgPPG からW/D/L確率を近似し、残り試合をランダムにシミュレーション。
 * - EPLドロー率は約25%と仮定
 * - simCount 回（デフォルト5000）シミュレーションして頻度から確率を算出
 */
export function calcProbabilities(
  timelines: TeamTimeline[],
  maxMatchday: number,
  simCount = 5000,
): TeamProbabilities[] {
  if (timelines.length === 0) return [];

  const remaining = Math.max(0, TOTAL_MATCHDAYS - maxMatchday);
  const n = timelines.length;

  // maxMatchday === 38 の場合は現在の順位から確定確率を返す
  if (remaining === 0) {
    const sorted = [...timelines].sort((a, b) => (b.points.at(-1) ?? 0) - (a.points.at(-1) ?? 0));
    return timelines.map((tl) => {
      const rank = sorted.findIndex((s) => s.teamId === tl.teamId) + 1;
      return {
        teamId: tl.teamId,
        titleProb: rank === 1 ? 1 : 0,
        clProb: rank <= 5 ? 1 : 0,
        survivalProb: rank <= 17 ? 1 : 0,
      };
    });
  }

  const DRAW_RATE = 0.25;

  // 各チームのW確率・D確率・現在勝点
  const teamProbs = timelines.map((tl) => {
    const avgPPG = Math.max(0, Math.min(3, tl.avgPPG));
    const winProb = Math.max(0, Math.min(1, (avgPPG - DRAW_RATE) / 3));
    const drawProb = Math.min(DRAW_RATE, 1 - winProb);
    return {
      winProb,
      drawProb,
      currentPts: tl.points.at(-1) ?? 0,
    };
  });

  const titleCount = new Array(n).fill(0);
  const clCount = new Array(n).fill(0);
  const survivalCount = new Array(n).fill(0);

  for (let sim = 0; sim < simCount; sim++) {
    const finalPts = teamProbs.map(({ winProb, drawProb, currentPts }) => {
      let pts = currentPts;
      for (let g = 0; g < remaining; g++) {
        const r = Math.random();
        if (r < winProb) pts += 3;
        else if (r < winProb + drawProb) pts += 1;
      }
      return pts;
    });

    // 勝点降順でランク付け（同点は順序不定）
    const ranked = finalPts
      .map((pts, i) => ({ i, pts }))
      .sort((a, b) => b.pts - a.pts);

    ranked.forEach(({ i }, rank) => {
      if (rank === 0) titleCount[i]++;
      if (rank < 5) clCount[i]++;
      if (rank < 17) survivalCount[i]++;
    });
  }

  return timelines.map((tl, i) => ({
    teamId: tl.teamId,
    titleProb: titleCount[i] / simCount,
    clProb: clCount[i] / simCount,
    survivalProb: survivalCount[i] / simCount,
  }));
}

/**
 * 最終順位1位・2位の直接対決を試合データから検出する。
 * - timelines は最終勝点降順ソート済みを前提とする（index 0=1位, index 1=2位）
 * - 返り値は matchday 昇順、最大2件
 */
export function detectHeadToHead(
  timelines: TeamTimeline[],
  matches: Match[],
): DramaticMoment[] {
  if (timelines.length < 2) return [];

  const team1Id = timelines[0].teamId;
  const team2Id = timelines[1].teamId;
  const team1Tla = timelines[0].teamShortName;
  const team2Tla = timelines[1].teamShortName;

  const h2hMatches = matches
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        ((m.homeTeam.id === team1Id && m.awayTeam.id === team2Id) ||
          (m.homeTeam.id === team2Id && m.awayTeam.id === team1Id)),
    )
    .sort((a, b) => a.matchday - b.matchday)
    .slice(0, 2);

  return h2hMatches.map((m) => {
    const home = m.score.fullTime.home ?? 0;
    const away = m.score.fullTime.away ?? 0;
    const homeTla = m.homeTeam.id === team1Id ? team1Tla : team2Tla;
    const awayTla = m.awayTeam.id === team1Id ? team1Tla : team2Tla;
    return {
      matchday: m.matchday,
      description: `${homeTla} vs ${awayTla} (${home}–${away})`,
      isHeadToHead: true,
    };
  });
}
