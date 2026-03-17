import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMatch, getMatches } from "@/lib/football-api";
import type { Booking, Goal, Match, MatchDetail, Substitution } from "@/types/football";

// ─── 日時フォーマット ─────────────────────────────────────────

function formatMatchDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatMatchTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(utcDate: string): string {
  const d = new Date(utcDate);
  const month = d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric" });
  const day = d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", day: "numeric" });
  const weekday = d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", weekday: "short" });
  const time = d.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });
  return `${month}${day}（${weekday}）${time}`;
}

function formatGD(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

// ─── 試合サマリー自動生成 ──────────────────────────────────────

function generateMatchSummary(match: Match): string[] {
  const points: string[] = [];
  const h = match.score.fullTime.home ?? 0;
  const a = match.score.fullTime.away ?? 0;
  const hh = match.score.halfTime?.home ?? 0;
  const ha = match.score.halfTime?.away ?? 0;

  // 勝敗
  if (h > a) {
    points.push(`${match.homeTeam.shortName}がホームで勝利`);
  } else if (a > h) {
    points.push(`${match.awayTeam.shortName}がアウェイで勝利`);
  } else {
    points.push(`両チームが勝点1ずつを分け合うドロー`);
  }

  // 前後半の流れ
  const secondHalfGoals = (h + a) - (hh + ha);

  if (hh > ha && h === a) {
    points.push(`${match.homeTeam.shortName}が前半リードも後半に追いつかれる`);
  } else if (ha > hh && h === a) {
    points.push(`${match.awayTeam.shortName}が前半リードも後半に追いつかれる`);
  } else if (hh === 0 && ha === 0 && (h > 0 || a > 0)) {
    points.push(`スコアレスの前半から後半に試合が動く展開`);
  } else if (secondHalfGoals === 0 && (hh > 0 || ha > 0)) {
    points.push(`前半の ${hh}-${ha} のまま試合終了`);
  } else if (secondHalfGoals > 0 && (hh > 0 || ha > 0)) {
    points.push(`前半 ${hh}-${ha} から後半にさらに${secondHalfGoals}得点が生まれる`);
  }

  // クリーンシートは得点が入った場合のみ表示
  if (h === 0 && a > 0) {
    points.push(`${match.awayTeam.shortName}がクリーンシートで完封`);
  } else if (a === 0 && h > 0) {
    points.push(`${match.homeTeam.shortName}がクリーンシートで完封`);
  }

  // 大差
  if (Math.abs(h - a) >= 3) {
    const winner = h > a ? match.homeTeam.shortName : match.awayTeam.shortName;
    points.push(`${winner}が${Math.abs(h - a)}点差の大勝`);
  }

  return points;
}

// ─── タイムラインイベント（有料プラン用・現在は非表示） ──────────

type EventType = "goal" | "own_goal" | "penalty" | "yellow" | "red" | "yellow_red" | "sub";

interface TimelineEvent {
  minute: number;
  type: EventType;
  side: "home" | "away";
  playerName: string;
  assistName?: string;
  playerInName?: string;
}

function buildTimeline(match: MatchDetail): TimelineEvent[] {
  const { homeTeam } = match;
  const events: TimelineEvent[] = [];

  for (const g of match.goals ?? []) {
    const side = g.team.id === homeTeam.id ? "home" : "away";
    const type: EventType =
      g.type === "OWN" ? "own_goal" : g.type === "PENALTY" ? "penalty" : "goal";
    events.push({ minute: g.minute ?? 0, type, side, playerName: g.scorer.name, assistName: g.assist?.name });
  }

  for (const b of match.bookings ?? []) {
    const side = b.team.id === homeTeam.id ? "home" : "away";
    const type: EventType = b.card === "RED" ? "red" : b.card === "YELLOW_RED" ? "yellow_red" : "yellow";
    events.push({ minute: b.minute ?? 0, type, side, playerName: b.player.name });
  }

  for (const s of match.substitutions ?? []) {
    const side = s.team.id === homeTeam.id ? "home" : "away";
    events.push({ minute: s.minute ?? 0, type: "sub", side, playerName: s.playerOut.name, playerInName: s.playerIn.name });
  }

  return events.sort((a, b) => a.minute - b.minute);
}

function EventIcon({ type }: { type: EventType }) {
  switch (type) {
    case "goal":
    case "penalty":
      return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-xs">⚽</span>;
    case "own_goal":
      return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-xs font-bold text-orange-700">OG</span>;
    case "yellow":
      return <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-yellow-300 text-xs">🟨</span>;
    case "red":
    case "yellow_red":
      return <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-red-200 text-xs">🟥</span>;
    case "sub":
      return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs">🔄</span>;
  }
}

function eventLabel(ev: TimelineEvent): string {
  if (ev.type === "penalty") return `${ev.playerName} (PK)`;
  if (ev.type === "sub" && ev.playerInName) return `${ev.playerName} → ${ev.playerInName}`;
  return ev.playerName;
}

// ─── スタッツ集計 ─────────────────────────────────────────────

function countCards(bookings: Booking[] | null, teamId: number, card: "YELLOW" | "RED" | "YELLOW_RED"): number {
  return (bookings ?? []).filter((b) => b.team.id === teamId && b.card === card).length;
}

function countSubs(subs: Substitution[] | null, teamId: number): number {
  return (subs ?? []).filter((s) => s.team.id === teamId).length;
}

function goalsForTeam(goals: Goal[] | null, teamId: number, opponentId: number): Goal[] {
  return (goals ?? []).filter(
    (g) =>
      (g.team.id === teamId && g.type !== "OWN") ||
      (g.team.id === opponentId && g.type === "OWN"),
  );
}

// ─── generateMetadata ─────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await getMatch(Number(id));
    const home = match.homeTeam.shortName;
    const away = match.awayTeam.shortName;
    const isFinished = match.status === "FINISHED";
    const score = isFinished
      ? `${match.score.fullTime.home}-${match.score.fullTime.away}`
      : "vs";
    return {
      title: `${home} ${score} ${away} | PremierNow`,
      description: `第${match.matchday}節 ${home} vs ${away} のマッチレポート`,
    };
  } catch {
    return { title: "マッチレポート | PremierNow" };
  }
}

// ─── ページ本体 ───────────────────────────────────────────────

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let match: MatchDetail;
  try {
    match = await getMatch(Number(id));
  } catch {
    notFound();
  }

  const { homeTeam, awayTeam, score, status, matchday, utcDate } = match;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "LIVE" || status === "PAUSED";
  const isScheduled = status === "SCHEDULED" || status === "TIMED";

  const homeScore = score.fullTime.home ?? 0;
  const awayScore = score.fullTime.away ?? 0;

  const homeScoreClass = homeScore > awayScore ? "text-[#2d0a4e]" : homeScore < awayScore ? "text-gray-400" : "text-gray-700";
  const awayScoreClass = awayScore > homeScore ? "text-[#2d0a4e]" : awayScore < homeScore ? "text-gray-400" : "text-gray-700";

  const timeline = buildTimeline(match);
  const homeGoals = goalsForTeam(match.goals, homeTeam.id, awayTeam.id);
  const awayGoals = goalsForTeam(match.goals, awayTeam.id, homeTeam.id);

  const homeYellow = countCards(match.bookings, homeTeam.id, "YELLOW");
  const awayYellow = countCards(match.bookings, awayTeam.id, "YELLOW");
  const homeRed = countCards(match.bookings, homeTeam.id, "RED") + countCards(match.bookings, homeTeam.id, "YELLOW_RED");
  const awayRed = countCards(match.bookings, awayTeam.id, "RED") + countCards(match.bookings, awayTeam.id, "YELLOW_RED");
  const homeSubs = countSubs(match.substitutions, homeTeam.id);
  const awaySubs = countSubs(match.substitutions, awayTeam.id);

  const mainReferee = (match.referees ?? []).find((r) => r.type === "REFEREE") ?? match.referees?.[0];

  // 試合サマリーと同節試合を並列取得
  const summary = (isFinished || isLive) ? generateMatchSummary(match) : [];
  const sameMatchdayData = await getMatches({ matchday }).catch(() => null);
  const sameMatchdayGames = sameMatchdayData?.matches ?? [];

  // スタッツ行（カード・交代はデータがある時のみ表示）
  const homePts = homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
  const awayPts = awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;

  type StatsRow = { label: string; home: string | number; away: string | number };
  const statsRows: StatsRow[] = [
    { label: "⚽ 得点", home: homeScore, away: awayScore },
    { label: "前半スコア", home: score.halfTime.home ?? 0, away: score.halfTime.away ?? 0 },
    { label: "後半スコア", home: homeScore - (score.halfTime.home ?? 0), away: awayScore - (score.halfTime.away ?? 0) },
    { label: "獲得勝点", home: homePts, away: awayPts },
    { label: "得失点差", home: formatGD(homeScore - awayScore), away: formatGD(awayScore - homeScore) },
    ...(match.bookings != null ? [
      { label: "🟨 イエローカード", home: homeYellow, away: awayYellow },
      { label: "🟥 レッドカード", home: homeRed, away: awayRed },
    ] : []),
    ...(match.substitutions != null ? [
      { label: "🔄 交代", home: homeSubs, away: awaySubs },
    ] : []),
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 戻るリンク */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← 試合一覧に戻る
        </Link>

        {/* ─── セクション1: ヘッダー ─── */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-6">
          <p className="text-center text-xs text-gray-500 mb-4">
            第<span className="font-mono tabular-nums">{matchday}</span>節 &nbsp;
            {formatMatchDate(utcDate)} &nbsp;
            {formatMatchTime(utcDate)} JST
          </p>

          <div className="flex items-center justify-center gap-6">
            {/* ホーム */}
            <div className="flex flex-col items-center gap-2 w-28">
              <Image src={homeTeam.crest} alt={homeTeam.name} width={56} height={56} className="object-contain" />
              <span className="text-sm font-semibold text-gray-900 text-center leading-tight">{homeTeam.shortName}</span>
            </div>

            {/* スコア */}
            <div className="text-center min-w-[100px]">
              {isFinished || isLive ? (
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-5xl font-bold font-mono tabular-nums ${homeScoreClass}`}>{homeScore}</span>
                  <span className="text-3xl font-light text-gray-400">–</span>
                  <span className={`text-5xl font-bold font-mono tabular-nums ${awayScoreClass}`}>{awayScore}</span>
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-600">{formatDateShort(utcDate)}</p>
              )}
              {(isFinished || isLive) && (
                <p className="text-xs text-gray-400 mt-1 font-mono tabular-nums">
                  前半 {score.halfTime.home ?? "—"}–{score.halfTime.away ?? "—"}
                </p>
              )}
            </div>

            {/* アウェイ */}
            <div className="flex flex-col items-center gap-2 w-28">
              <Image src={awayTeam.crest} alt={awayTeam.name} width={56} height={56} className="object-contain" />
              <span className="text-sm font-semibold text-gray-900 text-center leading-tight">{awayTeam.shortName}</span>
            </div>
          </div>

          {match.venue && (
            <p className="text-center text-xs text-gray-400 mt-4">会場: {match.venue}</p>
          )}
        </section>

        {/* ─── セクション2: 試合サマリー ─── */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">試合サマリー</h2>

          {isScheduled ? (
            <p className="text-sm text-gray-400 text-center py-4">試合前のため詳細データはありません</p>
          ) : (
            <>
              {/* ① 自動生成テキスト */}
              {summary.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#00a8e8] mt-0.5 shrink-0">▶</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              {/* タイムライン（有料プランで取得できた場合のみ） */}
              {match.goals != null && timeline.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  <p className="text-xs font-medium text-gray-500 mb-2">得点・カード・交代</p>
                  {timeline.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 flex items-center justify-end gap-1 text-right min-w-0">
                        {ev.side === "home" && (
                          <>
                            <span className="text-gray-700 truncate">{eventLabel(ev)}</span>
                            <EventIcon type={ev.type} />
                          </>
                        )}
                      </div>
                      <div className="w-10 shrink-0 text-center font-mono tabular-nums text-gray-400">
                        {ev.minute}&apos;
                      </div>
                      <div className="flex-1 flex items-center justify-start gap-1 text-left min-w-0">
                        {ev.side === "away" && (
                          <>
                            <EventIcon type={ev.type} />
                            <span className="text-gray-700 truncate">{eventLabel(ev)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ② 同節の他の試合結果 */}
              {sameMatchdayGames.length > 1 && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    第<span className="font-mono tabular-nums">{matchday}</span>節 他の試合
                  </p>
                  <div className="space-y-1">
                    {sameMatchdayGames
                      .filter((m) => m.id !== match.id)
                      .map((m) => (
                        <Link href={`/matches/${m.id}`} key={m.id}>
                          <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                            <span className="text-gray-600 w-24 truncate text-right">{m.homeTeam.shortName}</span>
                            <span className="font-mono font-bold text-gray-900 mx-2 shrink-0">
                              {m.status === "FINISHED"
                                ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
                                : "vs"}
                            </span>
                            <span className="text-gray-600 w-24 truncate">{m.awayTeam.shortName}</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ─── セクション3: チームスタッツ ─── */}
        {(isFinished || isLive) && (
          <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">スタッツ</h2>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {statsRows.map(({ label, home, away }) => (
                  <tr key={label}>
                    <td className="py-1.5 text-right font-mono tabular-nums text-gray-900 w-16 pr-2">{home}</td>
                    <td className="py-1.5 text-center text-gray-500 px-2">{label}</td>
                    <td className="py-1.5 text-left font-mono tabular-nums text-gray-900 w-16 pl-2">{away}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ─── セクション4: 得点者詳細 ─── */}
        {(isFinished || isLive) && (homeGoals.length > 0 || awayGoals.length > 0) && (
          <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">得点者</h2>
            <ul className="space-y-1 text-xs text-gray-700">
              {[...homeGoals.map((g) => ({ ...g, teamShort: homeTeam.shortName })),
                ...awayGoals.map((g) => ({ ...g, teamShort: awayTeam.shortName }))]
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
                .map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>⚽</span>
                    <span>
                      <span className="font-mono tabular-nums text-gray-400">{g.minute ?? "—"}&apos;</span>
                      {" "}
                      <span className="font-medium">{g.scorer.name}</span>
                      {g.type === "PENALTY" && <span className="text-gray-400"> (PK)</span>}
                      {g.type === "OWN" && <span className="text-orange-600"> (OG)</span>}
                      {g.assist && <span className="text-gray-400">（アシスト: {g.assist.name}）</span>}
                      <span className="text-gray-400"> [{g.teamShort}]</span>
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* ─── セクション5: 審判 ─── */}
        {mainReferee && (
          <section className="bg-white border border-gray-200 rounded shadow-sm px-4 py-3">
            <p className="text-xs text-gray-500">
              主審: <span className="text-gray-700 font-medium">{mainReferee.name}</span>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
