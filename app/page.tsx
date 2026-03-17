import Link from "next/link";
import { getFeaturedArticles } from "@/lib/articles";
import { quizzes } from "@/lib/quiz-data";
import { getMatches, getUpcomingMatches, getStandings, getScorers } from "@/lib/football-api";
import { convertToJSTMedium } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 1800;

export const metadata = createMetadata(
  "PremierNow - プレミアリーグ データ分析",
  "プレミアリーグの順位表・試合結果・得点王・データ分析を日本語で。毎節更新。",
  "/",
  "PremierNow",
);

export default async function Home() {
  const [featuredArticles, matchesData, upcomingRaw, standingsData, scorersData] =
    await Promise.all([
      Promise.resolve(getFeaturedArticles()),
      getMatches({ status: "FINISHED" }),
      getUpcomingMatches(3),
      getStandings(),
      getScorers(),
    ]);

  const recentMatches = [...(matchesData.matches ?? [])]
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 3);

  const recentIds = new Set(recentMatches.map((m) => m.id));
  const upcomingMatches = upcomingRaw.filter((m) => !recentIds.has(m.id));

  const table = standingsData.standings?.find((s) => s.type === "TOTAL")?.table ?? [];
  const leader = table[0];
  const second = table[1];
  const relegationBorder = table[17];
  const seventeenthPt = table[16]?.points;
  const topAttack = [...table].sort((a, b) => b.goalsFor - a.goalsFor)[0];
  const topScorer = scorersData.scorers?.[0];
  const ptDiff = seventeenthPt != null && relegationBorder
    ? seventeenthPt - relegationBorder.points
    : null;

  return (
    <main className="min-h-screen bg-pn-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PremierNow",
          url: "https://premiernow.jp",
          description: "プレミアリーグのデータ分析サイト",
          inLanguage: "ja",
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">

        {/* 1. 注目のデータ */}
        {table.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00a8e8] rounded inline-block" />
                <p className="text-sm font-semibold text-[#2d0a4e]">注目のデータ</p>
              </div>
              <Link href="/standings" className="text-xs text-[#00a8e8] hover:underline">
                順位表を見る →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">

              {/* 首位チーム */}
              {leader && (
                <Link
                  href="/standings"
                  className="block bg-white border border-gray-200 rounded p-4 border-l-4 border-l-[#00a8e8] hover:border-[#00a8e8] transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-500 mb-1">👑 首位</p>
                  <p className="text-4xl font-bold font-mono text-[#2d0a4e] leading-none">
                    {leader.points}
                    <span className="text-base font-normal ml-1">pt</span>
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {leader.team.crest && (
                      <img src={leader.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" />
                    )}
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {leader.team.shortName ?? leader.team.name}
                    </p>
                  </div>
                  {second && (
                    <p className="text-xs text-gray-500 mt-0.5 font-mono tabular-nums">
                      2位と +{leader.points - second.points}pt差
                    </p>
                  )}
                </Link>
              )}

              {/* 得点王 */}
              {topScorer && (
                <Link
                  href="/players"
                  className="block bg-white border border-gray-200 rounded p-4 border-l-4 border-l-[#f59e0b] hover:border-[#00a8e8] transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-500 mb-1">⚽ 得点王</p>
                  <p className="text-4xl font-bold font-mono text-[#2d0a4e] leading-none">
                    {topScorer.goals}
                    <span className="text-base font-normal ml-1">得点</span>
                  </p>
                  <p className="text-xs text-gray-700 font-medium mt-2 truncate">
                    {topScorer.player.name}
                  </p>
                  {topScorer.team?.shortName && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {topScorer.team.shortName}
                    </p>
                  )}
                </Link>
              )}

              {/* 最多得点チーム */}
              {topAttack && (
                <Link
                  href="/charts/style"
                  className="block bg-white border border-gray-200 rounded p-4 border-l-4 border-l-[#10b981] hover:border-[#00a8e8] transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-500 mb-1">🔥 最多得点</p>
                  <p className="text-4xl font-bold font-mono text-[#2d0a4e] leading-none">
                    {topAttack.goalsFor}
                    <span className="text-base font-normal ml-1">得点</span>
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {topAttack.team.crest && (
                      <img src={topAttack.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" />
                    )}
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {topAttack.team.shortName ?? topAttack.team.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">リーグ最多得点</p>
                </Link>
              )}

              {/* 降格ライン */}
              {relegationBorder && (
                <Link
                  href="/charts/race"
                  className="block bg-white border border-gray-200 rounded p-4 border-l-4 border-l-[#ef4444] hover:border-[#00a8e8] transition-colors cursor-pointer"
                >
                  <p className="text-xs text-gray-500 mb-1">⚠️ 降格ライン</p>
                  <p className="text-4xl font-bold font-mono text-[#ef4444] leading-none">
                    {ptDiff != null ? `-${ptDiff}` : relegationBorder.points}
                    <span className="text-base font-normal ml-1">pt</span>
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {relegationBorder.team.crest && (
                      <img src={relegationBorder.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" />
                    )}
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {relegationBorder.team.shortName ?? relegationBorder.team.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">現在18位・残留争い</p>
                </Link>
              )}

            </div>
          </section>
        )}

        {/* 2. クイズ ＋ 記事（横2列） */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2">

          {/* 左：ピックアップクイズ */}
          <section className="bg-[#e6f6fd] border border-[#00a8e8] rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00a8e8] rounded inline-block" />
                <p className="text-sm font-semibold text-[#2d0a4e]">クイズに挑戦</p>
              </div>
              <Link href="/articles/quiz" className="text-xs text-[#00a8e8] hover:underline">
                すべて見る →
              </Link>
            </div>
            {quizzes[0] && (
              <Link
                href={`/articles/quiz/${quizzes[0].slug}`}
                className="block bg-white border border-[#00a8e8] rounded p-4 hover:bg-[#f0faff] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-pn-blue-light text-pn-navy px-2 py-0.5 rounded">
                    クイズ
                  </span>
                  <span className="text-xs text-gray-400">全{quizzes[0].questions.length}問</span>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {quizzes[0].title}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {quizzes[0].description}
                </p>
                <p className="text-[#00a8e8] font-medium text-sm mt-2">挑戦する →</p>
              </Link>
            )}
          </section>

          {/* 右：ピックアップ記事 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00a8e8] rounded inline-block" />
                <p className="text-sm font-semibold text-[#2d0a4e]">ピックアップ記事</p>
              </div>
              <Link href="/articles" className="text-xs text-[#00a8e8] hover:underline">
                すべて見る →
              </Link>
            </div>
            {featuredArticles.length === 0 ? (
              <p className="text-sm text-gray-400">記事を準備中です。</p>
            ) : (
              <div className="space-y-2">
                {featuredArticles.slice(0, 2).map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="block bg-white border border-gray-200 rounded p-3 hover:border-pn-blue transition-colors cursor-pointer"
                  >
                    <p className="font-medium text-gray-900 text-sm hover:text-pn-blue leading-snug">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.description}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-2 text-xs text-gray-400">
                      <span>{article.publishedAt}</span>
                      <span>{article.readingTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* 3. 試合情報 2カラム */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* 次の試合（SP: 上、PC: 右） */}
          <section className="order-first md:order-last">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                次の試合
              </p>
              <Link href="/matches" className="text-xs text-pn-blue hover:underline">
                すべて見る →
              </Link>
            </div>
            {upcomingMatches.length === 0 ? (
              <p className="text-sm text-gray-400">試合予定がありません。</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="bg-white border border-gray-100 rounded p-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {convertToJSTMedium(match.utcDate)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono tabular-nums">
                        第{match.matchday}節
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {match.homeTeam.crest && (
                          <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 truncate">
                          {match.homeTeam.shortName}
                        </span>
                      </div>
                      <span className="text-gray-400 shrink-0 text-xs">vs</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-gray-900 truncate">
                          {match.awayTeam.shortName}
                        </span>
                        {match.awayTeam.crest && (
                          <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 直近の結果（SP: 下、PC: 左） */}
          <section className="order-last md:order-first">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                直近の結果
              </p>
              <Link href="/matches" className="text-xs text-pn-blue hover:underline">
                すべて見る →
              </Link>
            </div>
            {recentMatches.length === 0 ? (
              <p className="text-sm text-gray-400">試合データがありません。</p>
            ) : (
              <div className="space-y-2">
                {recentMatches.map((match) => (
                  <div key={match.id} className="bg-white border border-gray-100 rounded p-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {convertToJSTMedium(match.utcDate)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono tabular-nums">
                        第{match.matchday}節
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {match.homeTeam.crest && (
                          <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 truncate">
                          {match.homeTeam.shortName}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-gray-900 shrink-0">
                        {match.score.fullTime.home} - {match.score.fullTime.away}
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-gray-900 truncate">
                          {match.awayTeam.shortName}
                        </span>
                        {match.awayTeam.crest && (
                          <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </main>
  );
}
