// football-data.org API 型定義

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

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
}

export interface StandingsTable {
  stage: string;
  type: string;
  table: Standing[];
}

export interface StandingsResponse {
  competition: Competition;
  standings: StandingsTable[];
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string;
}

export interface Score {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    nationality: string;
  };
  team: Team;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface ScorersResponse {
  scorers: Scorer[];
}
