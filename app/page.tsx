import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedArticles } from "@/lib/articles";
import { quizzes } from "@/lib/quiz-data";
import { getMatches, getUpcomingMatches } from "@/lib/football-api";
import { convertToJSTMedium } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 1800;

const OG_TITLE = "PremierInsight - プレミアリーグ データ分析";
const OG_DESC =
  "プレミアリーグの順位表・試合結果・得点王・データ分析を日本語で。毎節更新。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("PremierInsight")}`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [`/api/og?title=${encodeURIComponent("PremierInsight")}`],
  },
};

export default async function Home() {
  const [featuredArticles, matchesData, upcomingRaw] = await Promise.all([
    Promise.resolve(getFeaturedArticles()),
    getMatches({ status: "FINISHED" }),
    getUpcomingMatches(3),
  ]);

  const recentMatches = [...(matchesData.matches ?? [])]
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 3);

  // 直近の結果に含まれる試合を次の試合から除外（重複防止）
  const recentIds = new Set(recentMatches.map((m) => m.id));
  const upcomingMatches = upcomingRaw.filter((m) => !recentIds.has(m.id));

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PremierInsight",
          url: "https://premier-insight.vercel.app",
          description: "プレミアリーグのデータ分析サイト",
          inLanguage: "ja",
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">

        {/* ヒーローエリア */}
        <div className="py-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            PremierInsight
          </h1>
        </div>

        {/* ピックアップ記事 */}
        <section>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            ピックアップ記事
          </p>
          {featuredArticles.length === 0 ? (
            <p className="text-sm text-gray-400">記事を準備中です。</p>
          ) : (
            <div className="space-y-2">
              {featuredArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block bg-white border border-gray-200 rounded p-3 hover:border-violet-300 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-gray-900 hover:text-violet-600">
                    {article.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{article.description}</p>
                  <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span>{article.publishedAt}</span>
                    <span>{article.readingTime}</span>
                    {article.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ピックアップクイズ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              ピックアップクイズ
            </p>
            <Link href="/articles/quiz" className="text-xs text-violet-600 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizzes.slice(0, 2).map((quiz) => (
              <Link
                key={quiz.slug}
                href={`/articles/quiz/${quiz.slug}`}
                className="block bg-white border border-gray-200 rounded p-3 hover:border-violet-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                    クイズ
                  </span>
                  <span className="text-xs text-gray-400">全{quiz.questions.length}問</span>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {quiz.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {quiz.description}
                </p>
                <p className="text-xs text-violet-600 mt-2 font-medium">挑戦する →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 試合情報 2カラム */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* 次の試合（SP: 上、PC: 右） */}
          <section className="order-first md:order-last">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                次の試合
              </p>
              <Link href="/matches" className="text-xs text-violet-600 hover:underline">
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
              <Link href="/matches" className="text-xs text-violet-600 hover:underline">
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
