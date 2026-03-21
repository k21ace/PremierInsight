import Link from "next/link";
import { getFeaturedArticles } from "@/lib/articles";
import { quizzes } from "@/lib/quiz-data";
import { getMatches, getUpcomingMatches, getFeaturedMatchDetail } from "@/lib/football-api";
import { convertToJSTMedium } from "@/lib/utils";
import { calcPointsTimeline } from "@/lib/chart-utils";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";
import TitleRaceChart from "@/components/TitleRaceChart";
import FeaturedMatchCard, { buildRecentMatches } from "@/components/FeaturedMatchCard";
import { FEATURED_MATCH_CONFIG, type FeaturedMatchConfig } from "@/lib/match-preview-data";

export const revalidate = 1800;

export const metadata = createMetadata(
  "PremierNow - プレミアリーグ データ分析",
  "プレミアリーグの順位表・試合結果・得点王・データ分析を日本語で。毎節更新。",
  "/",
  "PremierNow",
);

export default async function Home() {
  const [featuredArticles, matchesData, upcomingRaw, featuredMatchDetail] =
    await Promise.all([
      Promise.resolve(getFeaturedArticles()),
      getMatches({ status: "FINISHED" }),
      getUpcomingMatches(3),
      getFeaturedMatchDetail(
        FEATURED_MATCH_CONFIG.homeTeamId,
        FEATURED_MATCH_CONFIG.awayTeamId,
      ),
    ]);

  const timelines = calcPointsTimeline(matchesData.matches ?? []);

  const recentMatches = [...(matchesData.matches ?? [])]
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 3);

  const recentIds = new Set(recentMatches.map((m) => m.id));
  const upcomingMatches = upcomingRaw.filter((m) => !recentIds.has(m.id));

  // 次の注目カード: API データと injuries をマージ
  const allFinished = matchesData.matches ?? [];
  let featuredMatch: FeaturedMatchConfig | null = null;
  let homeForm: string[] = [];
  let awayForm: string[] = [];
  let homeRecentMatches: ReturnType<typeof buildRecentMatches> = [];
  let awayRecentMatches: ReturnType<typeof buildRecentMatches> = [];

  if (featuredMatchDetail) {
    const homeId = featuredMatchDetail.homeTeam.id;
    const awayId = featuredMatchDetail.awayTeam.id;

    homeForm = allFinished
      .filter((m) => m.homeTeam.id === homeId || m.awayTeam.id === homeId)
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, 5)
      .reverse()
      .map((m) => {
        const isHome = m.homeTeam.id === homeId;
        const h = m.score.fullTime.home ?? 0;
        const a = m.score.fullTime.away ?? 0;
        if (h === a) return "D";
        return isHome ? (h > a ? "W" : "L") : (a > h ? "W" : "L");
      });

    awayForm = allFinished
      .filter((m) => m.homeTeam.id === awayId || m.awayTeam.id === awayId)
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, 5)
      .reverse()
      .map((m) => {
        const isHome = m.homeTeam.id === awayId;
        const h = m.score.fullTime.home ?? 0;
        const a = m.score.fullTime.away ?? 0;
        if (h === a) return "D";
        return isHome ? (h > a ? "W" : "L") : (a > h ? "W" : "L");
      });

    homeRecentMatches = buildRecentMatches(homeId, allFinished);
    awayRecentMatches = buildRecentMatches(awayId, allFinished);

    featuredMatch = {
      matchId: FEATURED_MATCH_CONFIG.quizSlug,
      homeTeam: {
        ...featuredMatchDetail.homeTeam,
        injuries: FEATURED_MATCH_CONFIG.homeInjuries,
      },
      awayTeam: {
        ...featuredMatchDetail.awayTeam,
        injuries: FEATURED_MATCH_CONFIG.awayInjuries,
      },
      utcDate: featuredMatchDetail.utcDate,
      matchday: featuredMatchDetail.matchday,
      venue: featuredMatchDetail.venue ?? "未定",
      quizSlug: FEATURED_MATCH_CONFIG.quizSlug,
    };
  }

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
          <TitleRaceChart timelines={timelines} />
        </section>

        {/* 2. 次の注目カード */}
        {featuredMatch && (
          <FeaturedMatchCard
            config={featuredMatch}
            homeForm={homeForm}
            awayForm={awayForm}
            homeRecentMatches={homeRecentMatches}
            awayRecentMatches={awayRecentMatches}
          />
        )}

        {/* 3. クイズ ＋ 記事（横2列） */}
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

        {/* 4. 試合情報 2カラム */}
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
                  <div key={match.id} className="bg-white border border-gray-100 rounded px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {convertToJSTMedium(match.utcDate)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono tabular-nums">
                        第{match.matchday}節
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-0 w-full">
                      <div className="flex items-center justify-end gap-1.5 w-[120px] flex-shrink-0">
                        <span className="text-xs font-medium text-gray-900 truncate text-right">
                          {match.homeTeam.shortName}
                        </span>
                        {match.homeTeam.crest && (
                          <img src={match.homeTeam.crest} alt="" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
                        )}
                      </div>
                      <div className="w-[56px] text-center flex-shrink-0">
                        <span className="text-xs text-gray-400">vs</span>
                      </div>
                      <div className="flex items-center justify-start gap-1.5 w-[120px] flex-shrink-0">
                        {match.awayTeam.crest && (
                          <img src={match.awayTeam.crest} alt="" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {match.awayTeam.shortName}
                        </span>
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
                  <Link key={match.id} href={`/matches/${match.id}`} className="block bg-white border border-gray-100 rounded px-3 py-2 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {convertToJSTMedium(match.utcDate)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono tabular-nums">
                        第{match.matchday}節
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-0 w-full">
                      <div className="flex items-center justify-end gap-1.5 w-[120px] flex-shrink-0">
                        <span className="text-xs font-medium text-gray-900 truncate text-right">
                          {match.homeTeam.shortName}
                        </span>
                        {match.homeTeam.crest && (
                          <img src={match.homeTeam.crest} alt="" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
                        )}
                      </div>
                      <div className="w-[56px] text-center flex-shrink-0">
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {match.score.fullTime.home} - {match.score.fullTime.away}
                        </span>
                      </div>
                      <div className="flex items-center justify-start gap-1.5 w-[120px] flex-shrink-0">
                        {match.awayTeam.crest && (
                          <img src={match.awayTeam.crest} alt="" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {match.awayTeam.shortName}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </main>
  );
}
