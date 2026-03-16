import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticlesView from "./ArticlesView";

const OG_TITLE = "プレミアリーグ 分析記事一覧 | PremierInsight";
const OG_DESC =
  "プレミアリーグの試合分析・データ解説記事。毎節更新。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/articles",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ 分析記事一覧")}`,
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
    images: [`/api/og?title=${encodeURIComponent("プレミアリーグ 分析記事一覧")}`],
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          分析記事
        </h1>

        {/* クイズ導線バナー */}
        <div className="bg-violet-50 border border-violet-200 rounded p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-violet-900">クイズで腕試し！</p>
            <p className="text-xs text-violet-700 mt-1">
              プレミアリーグクイズに挑戦してみよう
            </p>
          </div>
          <Link
            href="/articles/quiz"
            className="text-sm text-violet-600 font-medium hover:underline shrink-0"
          >
            挑戦する →
          </Link>
        </div>

        <ArticlesView articles={articles} allTags={allTags} />
      </div>
    </main>
  );
}
