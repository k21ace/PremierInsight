/**
 * football-data.org API wrapper
 * Docs: https://www.football-data.org/documentation/quickstart
 */

const BASE_URL = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";

// Premier League competition ID
const PL_ID = "PL";

async function fetchFootball<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": API_KEY },
    next: { revalidate: 3600 }, // ISR: 1 hour cache
  });

  if (!res.ok) {
    throw new Error(`Football API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// TODO: 実装予定
export async function getStandings() {
  return fetchFootball(`/competitions/${PL_ID}/standings`);
}

export async function getMatches() {
  return fetchFootball(`/competitions/${PL_ID}/matches`);
}

export async function getScorers() {
  return fetchFootball(`/competitions/${PL_ID}/scorers`);
}
