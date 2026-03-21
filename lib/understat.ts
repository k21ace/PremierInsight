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

export type UnderstatShot = {
  id: string;
  minute: string;
  result: "Goal" | "SavedShot" | "MissedShots" | "BlockedShot" | "OwnGoal" | "ShotOnPost";
  X: number; // 0–1, 1 = attacking goal
  Y: number; // 0–1, 0 = top
  xG: number;
  player: string;
  h_a: "h" | "a"; // home or away
  player_id: string;
  situation: string;
  season: string;
  shotType: string;
  match_id: string;
  h_team: string;
  a_team: string;
  date: string;
  player_assisted: string | null;
  lastAction: string;
};

// ─── Session ──────────────────────────────────────────────

/** HTML を取得し Set-Cookie ヘッダーから PHPSESSID を返す */
async function getSessionCookie(season: number): Promise<string> {
  const res = await fetch(`https://understat.com/league/EPL/${season}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Understat session fetch failed: ${res.status}`);
  // "PHPSESSID=xxx; ..., UID=xxx; ..." から全cookie文字列を組み立てる
  const raw = res.headers.getSetCookie?.() ?? [];
  if (raw.length) {
    return raw.map((c) => c.split(";")[0]).join("; ");
  }
  // Node 18 では getSetCookie() がない場合は get() にフォールバック
  return res.headers.get("set-cookie")?.split(",").map((c) => c.trim().split(";")[0]).join("; ") ?? "";
}

// ─── Base fetcher (session → API) ─────────────────────────

async function fetchLeagueData(
  season: number,
): Promise<{ teams: Record<string, UnderstatTeam>; players: UnderstatPlayer[] }> {
  const cookie = await getSessionCookie(season);

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": `https://understat.com/league/EPL/${season}`,
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json, text/javascript, */*; q=0.01",
  };
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(
    `https://understat.com/getLeagueData/EPL/${season}`,
    { headers },
  );
  if (!res.ok) throw new Error(`getLeagueData failed: ${res.status}`);

  const json = (await res.json()) as {
    teams: Record<string, UnderstatTeam>;
    players: UnderstatPlayer[];
  };
  return json;
}

// ─── Cached Fetchers ──────────────────────────────────────

export const getUnderstatTeams = unstable_cache(
  async (season: number = 2025): Promise<Record<string, UnderstatTeam>> => {
    const data = await fetchLeagueData(season);
    return data.teams;
  },
  ["understat-teams"],
  { revalidate: 86400 },
);

export const getUnderstatPlayers = unstable_cache(
  async (season: number = 2025): Promise<UnderstatPlayer[]> => {
    const data = await fetchLeagueData(season);
    return data.players;
  },
  ["understat-players"],
  { revalidate: 86400 },
);

// ─── Team Shot Data (match-by-match) ─────────────────────

/** チームタイトルを Understat URL 用の名前に変換 (スペース→アンダースコア) */
export function teamTitleToUrl(title: string): string {
  return title.replace(/ /g, "_");
}

/** Understat ページ HTML から JSON 変数を抽出してパース */
async function parseUnderstatPage<T>(url: string, varName: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Understat fetch failed: ${res.status} ${url}`);
  const html = await res.text();
  // Understat embeds: var datesData = JSON.parse('...')
  const re = new RegExp(`var\\s+${varName}\\s*=\\s*JSON\\.parse\\('([\\s\\S]+?)'\\)`);
  const m = html.match(re);
  if (!m) throw new Error(`${varName} not found in ${url}`);
  // Decode \\uXXXX escapes embedded by Python's unicode_escape
  const jsonStr = m[1].replace(/\\u([\dA-Fa-f]{4})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  );
  return JSON.parse(jsonStr) as T;
}

// datesData の1エントリ（チームページ）
type MatchDate = {
  id: string;
  isResult: boolean | number;
  h: { id: string; title: string };
  a: { id: string; title: string };
  datetime: string;
};

// 試合ページの shotsData は { h: [...], a: [...] }
type MatchShotsRaw = {
  h: Record<string, unknown>[];
  a: Record<string, unknown>[];
};

/** チームページの datesData から試合IDと自チームのロール(h/a)を取得 */
async function fetchTeamMatchInfo(
  teamTitle: string,
  season: number,
): Promise<{ matchId: string; teamRole: "h" | "a"; h_title: string; a_title: string; date: string }[]> {
  const urlName = teamTitleToUrl(teamTitle);
  const dates = await parseUnderstatPage<MatchDate[]>(
    `https://understat.com/team/${urlName}/${season}`,
    "datesData",
  );
  const norm = teamTitle.toLowerCase().replace(/\s+/g, "");
  return dates
    .filter((d) => Boolean(d.isResult))
    .map((d) => ({
      matchId: d.id,
      teamRole: d.h.title.toLowerCase().replace(/\s+/g, "") === norm ? "h" : "a",
      h_title: d.h.title,
      a_title: d.a.title,
      date: d.datetime.split(" ")[0],
    }));
}

/** 試合ページから両チームのシュートを取得（試合単位でキャッシュ） */
const getSingleMatchShots = unstable_cache(
  async (
    matchId: string,
    h_title: string,
    a_title: string,
    date: string,
  ): Promise<UnderstatShot[]> => {
    const raw = await parseUnderstatPage<MatchShotsRaw>(
      `https://understat.com/match/${matchId}`,
      "shotsData",
    );
    const parseHalf = (shots: Record<string, unknown>[], h_a: "h" | "a"): UnderstatShot[] =>
      (shots ?? []).map((s) => ({
        id: String(s.id ?? ""),
        minute: String(s.minute ?? ""),
        result: (s.result as UnderstatShot["result"]) ?? "MissedShots",
        X: parseFloat(String(s.X ?? "0")),
        Y: parseFloat(String(s.Y ?? "0")),
        xG: parseFloat(String(s.xG ?? "0")),
        player: String(s.player ?? ""),
        h_a,
        player_id: String(s.player_id ?? ""),
        situation: String(s.situation ?? ""),
        season: String(s.season ?? ""),
        shotType: String(s.shotType ?? ""),
        match_id: matchId,
        h_team: h_title,
        a_team: a_title,
        date,
        player_assisted: s.player_assisted != null ? String(s.player_assisted) : null,
        lastAction: String(s.lastAction ?? ""),
      }));
    return [...parseHalf(raw.h ?? [], "h"), ...parseHalf(raw.a ?? [], "a")];
  },
  ["understat-match-shots"],
  { revalidate: 86400 * 30 }, // 試合結果は変わらないため30日キャッシュ
);

/**
 * 指定チームの今季全シュートを返す。
 * チームページ → datesData → 各試合ページ → shotsData の順に取得し、
 * 自チームのシュートのみフィルタして返す。
 */
export const getTeamShots = unstable_cache(
  async (teamTitle: string, season: number = 2025): Promise<UnderstatShot[]> => {
    const matches = await fetchTeamMatchInfo(teamTitle, season);

    // 5件ずつ並列取得（過負荷防止）
    const BATCH = 5;
    const teamShots: UnderstatShot[] = [];
    for (let i = 0; i < matches.length; i += BATCH) {
      const batch = matches.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map((m) => getSingleMatchShots(m.matchId, m.h_title, m.a_title, m.date)),
      );
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r.status === "fulfilled") {
          const role = batch[j].teamRole;
          teamShots.push(...r.value.filter((s) => s.h_a === role));
        }
      }
    }
    return teamShots;
  },
  ["understat-team-shots"],
  { revalidate: 3600 },
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
        npxG:
          Math.round(
            team.history.reduce((s, m) => s + m.npxG, 0) * 10,
          ) / 10,
      };
    })
    .sort((a, b) => b.xG - a.xG);
}
