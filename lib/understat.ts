import { unstable_cache } from "next/cache";

// ─── Types ────────────────────────────────────────────────

export type UnderstatMatchHistory = {
  xG: number;
  xGA: number;
  npxG: number;
  npxGA: number;
  scored: number;
  missed: number;
  result: "w" | "d" | "l";
  date: string;
  h_a: "h" | "a";
};

export type UnderstatTeam = {
  id: string;
  title: string;
  history: UnderstatMatchHistory[];
};

export type UnderstatPlayer = {
  id: string;
  player_name: string;
  team_title: string;
  games: string;
  goals: string;
  xG: string;
  assists: string;
  xA: string;
  shots: string;
  key_passes: string;
  npg: string;
  npxG: string;
};

export type TeamXgStats = {
  teamName: string;
  xG: number;
  xGA: number;
  scored: number;
  missed: number;
  xGDiff: number;
  xGADiff: number;
  npxG: number;
};

// ─── HTML Parser ──────────────────────────────────────────

function extractJson(html: string, varName: string): string {
  const regex = new RegExp(`${varName}\\s*=\\s*JSON\\.parse\\('(.*?)'\\)`);
  const match = html.match(regex);
  if (!match) throw new Error(`${varName} not found in Understat HTML`);
  return decodeURIComponent(match[1].replace(/\\x([0-9A-Fa-f]{2})/g, "%$1"));
}

async function fetchUnderstatHtml(season: number): Promise<string> {
  const res = await fetch(`https://understat.com/league/EPL/${season}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Understat fetch failed: ${res.status}`);
  return res.text();
}

// ─── Cached Fetchers ──────────────────────────────────────

export const getUnderstatTeams = unstable_cache(
  async (season: number = 2025): Promise<Record<string, UnderstatTeam>> => {
    const html = await fetchUnderstatHtml(season);
    return JSON.parse(extractJson(html, "teamsData"));
  },
  ["understat-teams"],
  { revalidate: 86400 },
);

export const getUnderstatPlayers = unstable_cache(
  async (season: number = 2025): Promise<UnderstatPlayer[]> => {
    const html = await fetchUnderstatHtml(season);
    return JSON.parse(extractJson(html, "playersData"));
  },
  ["understat-players"],
  { revalidate: 86400 },
);

// ─── Data Processing ──────────────────────────────────────

export function calcTeamXgStats(
  teams: Record<string, UnderstatTeam>,
): TeamXgStats[] {
  return Object.values(teams)
    .map((team) => {
      const xG = team.history.reduce((s, m) => s + m.xG, 0);
      const xGA = team.history.reduce((s, m) => s + m.xGA, 0);
      const scored = team.history.reduce((s, m) => s + m.scored, 0);
      const missed = team.history.reduce((s, m) => s + m.missed, 0);
      return {
        teamName: team.title,
        xG: Math.round(xG * 10) / 10,
        xGA: Math.round(xGA * 10) / 10,
        scored,
        missed,
        xGDiff: Math.round((scored - xG) * 10) / 10,
        xGADiff: Math.round((xGA - missed) * 10) / 10,
        npxG: Math.round(team.history.reduce((s, m) => s + m.npxG, 0) * 10) / 10,
      };
    })
    .sort((a, b) => b.xG - a.xG);
}
