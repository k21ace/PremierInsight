/**
 * football-data.org API v4 型定義
 * @see https://www.football-data.org/documentation/api
 */

/** リーグ（コンペティション）情報 */
export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string;
}

/** シーズン情報 */
export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: Team | null;
}

/** チーム情報 */
export interface Team {
  id: number;
  name: string;
  shortName: string;
  /** Three-letter abbreviation */
  tla: string;
  crest: string;
}

/** 順位表の1行分 */
export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string[];
}

/** 順位表グループ（TOTAL / HOME / AWAY） */
export interface StandingsTable {
  stage: string;
  type: "TOTAL" | "HOME" | "AWAY";
  table: Standing[];
}

/** GET /competitions/PL/standings レスポンス */
export interface StandingsResponse {
  competition: Competition;
  season: Season;
  standings: StandingsTable[];
}

// ─── Match ────────────────────────────────────────────────

/** 試合ステータス */
export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "LIVE"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "SUSPENDED";

/** ハーフタイム・フルタイムスコア */
export interface HalfScore {
  home: number | null;
  away: number | null;
}

/** スコア情報 */
export interface Score {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: HalfScore;
  halfTime: HalfScore;
}

/** 得点者情報（試合内） */
export interface Goal {
  minute: number | null;
  scorer: { id: number; name: string };
  team: { id: number; name: string };
  type: "REGULAR" | "OWN" | "PENALTY";
}

/** 試合情報 */
export interface Match {
  id: number;
  /** UTC形式の試合日時 例: "2025-08-16T14:00:00Z" */
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  goals: Goal[] | null;
}

/** GET /competitions/PL/matches の resultSet（試合件数・期間） */
export interface MatchesResultSet {
  count: number;
  competitions: string;
  /** シーズン開始日 例: "2024-08-16" */
  first: string;
  /** シーズン終了日 例: "2025-05-25" */
  last: string;
  played: number;
}

/** GET /competitions/PL/matches レスポンス */
export interface MatchesResponse {
  filters: Record<string, unknown>;
  resultSet: MatchesResultSet;
  competition: Competition;
  matches: Match[];
}

// ─── Scorers ──────────────────────────────────────────────

/** 得点王ランキングの1エントリー */
export interface Scorer {
  player: {
    id: number;
    name: string;
    nationality: string;
  };
  team: Team;
  /** 得点数 */
  goals: number;
  /** アシスト数（未集計の場合 null） */
  assists: number | null;
  /** 出場試合数 */
  playedMatches: number;
  /** PKによる得点数 */
  penalties: number | null;
}

/** GET /competitions/PL/scorers レスポンス */
export interface ScorersResponse {
  competition: Competition;
  season: Season;
  scorers: Scorer[];
}
