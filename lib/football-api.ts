/**
 * football-data.org API v4 ラッパー
 * @see https://www.football-data.org/documentation/quickstart
 *
 * 無料プラン制限: 10リクエスト / 分
 * 開発中はリクエスト数に注意し、console.log でレスポンスを確認すること。
 */

import type {
  Match,
  MatchesResponse,
  PersonResponse,
  ScorersResponse,
  StandingsResponse,
} from "@/types/football";

const BASE_URL = "https://api.football-data.org/v4";
/** Premier League の competition code */
const PL_ID = "PL";

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
  return fetchFootball<StandingsResponse>(
    `/competitions/${PL_ID}/standings`,
    3600,
  );
}

/**
 * standingType（TOTAL / HOME / AWAY）を指定して順位表を取得する。
 * football-data.org 無料プランではパラメータなしで HOME/AWAY が返らない場合があるため
 * HOME・AWAY は個別リクエストで取得する。
 * ISR キャッシュ: 1時間（3600秒）
 */
export async function getStandingsByType(
  type: "TOTAL" | "HOME" | "AWAY",
): Promise<StandingsResponse> {
  return fetchFootball<StandingsResponse>(
    `/competitions/${PL_ID}/standings`,
    3600,
    { standingType: type },
  );
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

  return fetchFootball<MatchesResponse>(
    `/competitions/${PL_ID}/matches`,
    1800,
    params,
  );
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
