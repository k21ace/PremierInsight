/**
 * football-data.org API v4 ラッパー
 * @see https://www.football-data.org/documentation/quickstart
 *
 * 無料プラン制限: 10リクエスト / 分
 * 開発中はリクエスト数に注意し、console.log でレスポンスを確認すること。
 */

import type {
  HomeAwayTable,
  Match,
  MatchDetail,
  MatchesResponse,
  PersonResponse,
  ScorersResponse,
  StandingsResponse,
  TeamInfo,
} from "@/types/football";

const BASE_URL = "https://api.football-data.org/v4";
/** Premier League の competition code */
const PL_ID = "PL";

// ─── チーム名正規化 ────────────────────────────────────────

/** API が返す shortName を表示用に正規化するマップ */
const SHORT_NAME_OVERRIDES: Record<string, string> = {
  "Brighton Hove": "Brighton",
};

function normalizeTeam<T extends { shortName: string }>(team: T): T {
  const shortName = SHORT_NAME_OVERRIDES[team.shortName] ?? team.shortName;
  return shortName === team.shortName ? team : { ...team, shortName };
}

// ─── 内部ユーティリティ ────────────────────────────────────

/**
 * football-data.org API への共通フェッチ関数。
 * APIキー未設定・HTTPエラー時は Error を throw する。
 */
async function fetchFootball<T>(
  path: string,
  revalidate: number,
  params?: Record<string, string>,
): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FOOTBALL_DATA_API_KEY が未設定です。.env.local を確認してください。",
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }

  const res = await fetch(url.toString(), {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(
      `Football API エラー [${res.status}]: ${res.statusText} — ${url.pathname}`,
    );
  }

  return res.json() as Promise<T>;
}

// ─── 公開 API 関数 ─────────────────────────────────────────

/**
 * プレミアリーグの順位表を取得する。
 * ISR キャッシュ: 1時間（3600秒）
 */
export async function getStandings(): Promise<StandingsResponse> {
  const data = await fetchFootball<StandingsResponse>(
    `/competitions/${PL_ID}/standings`,
    3600,
  );
  return {
    ...data,
    standings: data.standings.map((group) => ({
      ...group,
      table: group.table.map((s) => ({ ...s, team: normalizeTeam(s.team) })),
    })),
  };
}

/**
 * 終了済み試合データからホーム・アウェイ別の成績を集計して返す。
 * football-data.org 無料プランでは standingType パラメータが無視されるため、
 * matches データから自前で H/A 成績を算出する。
 * ISR キャッシュ: standings=3600秒 / matches=1800秒
 */
export async function getHomeAwayStandings(): Promise<{
  home: HomeAwayTable[];
  away: HomeAwayTable[];
}> {
  const [standingsData, matchesData] = await Promise.all([
    fetchFootball<StandingsResponse>(`/competitions/${PL_ID}/standings`, 3600),
    fetchFootball<MatchesResponse>(
      `/competitions/${PL_ID}/matches`,
      1800,
      { status: "FINISHED" },
    ),
  ]);

  const totalTable = standingsData.standings[0]?.table ?? [];
  const finishedMatches = matchesData.matches ?? [];

  // チーム情報を TOTAL standings から取得し、H/A 集計用マップを初期化
  const homeMap = new Map<number, HomeAwayTable>();
  const awayMap = new Map<number, HomeAwayTable>();

  for (const s of totalTable) {
    const base: HomeAwayTable = {
      position: 0,
      team: normalizeTeam(s.team),
      playedGames: 0, won: 0, draw: 0, lost: 0,
      points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    };
    homeMap.set(s.team.id, { ...base });
    awayMap.set(s.team.id, { ...base });
  }

  // 終了済み試合から H/A 成績を集計
  for (const match of finishedMatches) {
    const hg = match.score.fullTime.home ?? 0;
    const ag = match.score.fullTime.away ?? 0;

    const h = homeMap.get(match.homeTeam.id);
    if (h) {
      h.playedGames++;
      h.goalsFor += hg;
      h.goalsAgainst += ag;
      h.goalDifference += hg - ag;
      if (hg > ag) { h.won++; h.points += 3; }
      else if (hg === ag) { h.draw++; h.points += 1; }
      else { h.lost++; }
    }

    const a = awayMap.get(match.awayTeam.id);
    if (a) {
      a.playedGames++;
      a.goalsFor += ag;
      a.goalsAgainst += hg;
      a.goalDifference += ag - hg;
      if (ag > hg) { a.won++; a.points += 3; }
      else if (ag === hg) { a.draw++; a.points += 1; }
      else { a.lost++; }
    }
  }

  // 勝点降順 → 得失点差降順でソートし、順位を付与
  const sortAndRank = (entries: HomeAwayTable[]): HomeAwayTable[] =>
    [...entries]
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
      .map((e, i) => ({ ...e, position: i + 1 }));

  return {
    home: sortAndRank([...homeMap.values()]),
    away: sortAndRank([...awayMap.values()]),
  };
}

/**
 * チームIDと終了済み試合リストから直近5試合のW/D/Lを計算する。
 */
function computeForm(teamId: number, finishedMatches: Match[]): string[] {
  return finishedMatches
    .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 5)
    .reverse()
    .map((m) => {
      const isHome = m.homeTeam.id === teamId;
      const home = m.score.fullTime.home ?? 0;
      const away = m.score.fullTime.away ?? 0;
      if (home === away) return "D";
      return isHome ? (home > away ? "W" : "L") : (away > home ? "W" : "L");
    });
}

/**
 * 順位表を取得し、終了済み試合から直近5試合（form）を自前計算して付与する。
 * football-data.org 無料プランでは standings の form フィールドが null のため。
 * ISR キャッシュ: standings=1時間 / matches=30分
 */
export async function getStandingsWithForm(): Promise<StandingsResponse> {
  const [standingsData, matchesData] = await Promise.all([
    fetchFootball<StandingsResponse>(`/competitions/${PL_ID}/standings`, 3600),
    fetchFootball<MatchesResponse>(`/competitions/${PL_ID}/matches`, 1800, { status: "FINISHED" }),
  ]);

  const finishedMatches = matchesData.matches ?? [];

  const standings = standingsData.standings.map((group) => ({
    ...group,
    table: group.table.map((standing) => ({
      ...standing,
      team: normalizeTeam(standing.team),
      form: computeForm(standing.team.id, finishedMatches),
    })),
  }));

  return { ...standingsData, standings };
}

/**
 * プレミアリーグの試合一覧を取得する。
 * ISR キャッシュ: 30分（1800秒）
 *
 * @param options.matchday - 取得する節番号（省略時は全節）
 * @param options.status   - 試合ステータスで絞り込み（例: "FINISHED", "SCHEDULED"）
 */
export async function getMatches(options?: {
  matchday?: number;
  status?: string;
}): Promise<MatchesResponse> {
  const params: Record<string, string> = {};
  if (options?.matchday !== undefined) {
    params.matchday = String(options.matchday);
  }
  if (options?.status) {
    params.status = options.status;
  }

  const data = await fetchFootball<MatchesResponse>(
    `/competitions/${PL_ID}/matches`,
    1800,
    params,
  );
  return {
    ...data,
    matches: (data.matches ?? []).map((m) => ({
      ...m,
      homeTeam: normalizeTeam(m.homeTeam),
      awayTeam: normalizeTeam(m.awayTeam),
    })),
  };
}

/**
 * 直近の未消化試合（SCHEDULED / TIMED）を取得する。
 * 両ステータスを並行取得してマージし、試合日時の昇順で limit 件返す。
 * ISR キャッシュ: 1800秒
 */
export async function getUpcomingMatches(limit = 3): Promise<Match[]> {
  const [scheduledData, timedData] = await Promise.all([
    fetchFootball<MatchesResponse>(`/competitions/${PL_ID}/matches`, 1800, { status: "SCHEDULED" }),
    fetchFootball<MatchesResponse>(`/competitions/${PL_ID}/matches`, 1800, { status: "TIMED" }),
  ]);

  const merged = [
    ...(scheduledData.matches ?? []),
    ...(timedData.matches ?? []),
  ];

  // 重複除去（同一 id が両ステータスに含まれる場合）
  const seen = new Set<number>();
  const unique = merged.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  return unique
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, limit)
    .map((m) => ({
      ...m,
      homeTeam: normalizeTeam(m.homeTeam),
      awayTeam: normalizeTeam(m.awayTeam),
    }));
}

/**
 * 現在の節（マッチデー）番号を取得する。
 * getMatches() のレスポンスに含まれる season.currentMatchday を返す。
 * 取得できない場合は matches 配列から推定する。
 *
 * @returns 現在の節番号
 */
export async function getCurrentMatchday(): Promise<number> {
  const data = await getMatches();

  // /competitions/PL/matches レスポンスには season フィールドが存在しないため
  // matches 配列から現在の節を推定する
  const matches = data.matches ?? [];
  if (matches.length === 0) return 1;

  // FINISHED 試合の最大節番号（直近の終了節）
  const finishedMatchdays = matches
    .filter((m) => m.status === "FINISHED")
    .map((m) => m.matchday);
  if (finishedMatchdays.length > 0) {
    return Math.max(...finishedMatchdays);
  }

  // SCHEDULED 試合の最小節番号（次の予定節）
  const scheduledMatchdays = matches
    .filter((m) => m.status === "SCHEDULED")
    .map((m) => m.matchday);
  if (scheduledMatchdays.length > 0) {
    return Math.min(...scheduledMatchdays);
  }

  return matches[0].matchday ?? 1;
}

/**
 * プレミアリーグの得点王ランキングを取得する。
 * ISR キャッシュ: 6時間（21600秒）
 *
 * @param season - シーズン開始年（例: 2025 → 2025-26シーズン）。省略時は現在のシーズン。
 */
export async function getScorers(season?: number): Promise<ScorersResponse> {
  const params: Record<string, string> = {};
  if (season !== undefined) {
    params.season = String(season);
  }
  return fetchFootball<ScorersResponse>(
    `/competitions/${PL_ID}/scorers`,
    21600,
    params,
  );
}

/**
 * 選手詳細情報を取得する。
 * ISR キャッシュ: 24時間（86400秒）
 *
 * @param id - football-data.org の選手ID
 */
export async function getPlayer(id: number): Promise<PersonResponse> {
  return fetchFootball<PersonResponse>(`/persons/${id}`, 86400);
}

/**
 * 選手IDリストのうち、expectedTeamId に現在所属して**いない**選手IDの Set を返す。
 *
 * - `currentTeam` が null、または `currentTeam.id !== expectedTeamId` の場合に移籍済みと判定する。
 * - API エラーが発生した選手は移籍済みとはみなさない（フェイルオープン）。
 * - キャッシュは getPlayer に準じて 24時間。
 *
 * @param playerIds      - チェック対象の football-data.org 選手ID リスト
 * @param expectedTeamId - 在籍しているはずのチームID
 */
export async function getTransferredPlayerIds(
  playerIds: number[],
  expectedTeamId: number,
): Promise<Set<number>> {
  if (playerIds.length === 0) return new Set();

  const results = await Promise.allSettled(
    playerIds.map((id) => getPlayer(id)),
  );

  const transferred = new Set<number>();
  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      const { currentTeam } = result.value;
      if (currentTeam == null || currentTeam.id !== expectedTeamId) {
        const playerId = playerIds[idx];
        transferred.add(playerId);
        console.warn(
          `[注目カード] 移籍検知: playerId=${playerId} の現在のチームは` +
          ` "${currentTeam?.name ?? "不明"}"（期待: teamId=${expectedTeamId}）。` +
          ` FEATURED_MATCH_CONFIG から該当選手を削除してください。`,
        );
      }
    }
    // rejected = API エラー → 移籍済みとはみなさず表示を維持
  });

  return transferred;
}

/**
 * チーム詳細情報を取得する（監督・スタジアムを含む）。
 * ISR キャッシュ: 24時間（86400秒）
 *
 * @param id - football-data.org のチームID
 */
export async function getTeamInfo(id: number): Promise<TeamInfo> {
  return fetchFootball<TeamInfo>(`/teams/${id}`, 86400);
}

/**
 * 試合詳細情報を取得する（得点・カード・交代・審判を含む）。
 * ISR キャッシュ: 5分（300秒）
 *
 * @param id - football-data.org の試合ID
 */
export async function getMatch(id: number): Promise<MatchDetail> {
  const data = await fetchFootball<MatchDetail>(`/matches/${id}`, 300);
  return {
    ...data,
    homeTeam: normalizeTeam(data.homeTeam),
    awayTeam: normalizeTeam(data.awayTeam),
  };
}

/**
 * 指定したホーム/アウェイのチームIDで次の試合を検索し、詳細（venue を含む）を返す。
 * SCHEDULED・TIMED ステータスの試合を対象に探索する。
 * 見つからない場合は null を返す。
 *
 * SCHEDULED/TIMED の fetch は getUpcomingMatches() と同じURLのため、
 * Next.js のリクエストメモ化により同一レンダリング内では実際のHTTPリクエストは発生しない。
 *
 * ISR キャッシュ: 1800秒（SCHEDULED/TIMED）+ 300秒（match detail）
 *
 * @param homeTeamId - ホームチームの football-data.org チームID
 * @param awayTeamId - アウェイチームの football-data.org チームID
 */
export async function getFeaturedMatchDetail(
  homeTeamId: number,
  awayTeamId: number,
): Promise<MatchDetail | null> {
  const [scheduledData, timedData] = await Promise.all([
    fetchFootball<MatchesResponse>(`/competitions/${PL_ID}/matches`, 1800, { status: "SCHEDULED" }),
    fetchFootball<MatchesResponse>(`/competitions/${PL_ID}/matches`, 1800, { status: "TIMED" }),
  ]);

  const all = [
    ...(scheduledData.matches ?? []),
    ...(timedData.matches ?? []),
  ];

  const match = all.find(
    (m) => m.homeTeam.id === homeTeamId && m.awayTeam.id === awayTeamId,
  );

  if (!match) return null;

  return getMatch(match.id);
}
