import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticlesView from "./ArticlesView";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "プレミアリーグ 分析記事一覧 | PremierNow",
  "プレミアリーグの試合分析・データ解説記事。毎節更新。",
  "/articles",
  "プレミアリーグ 分析記事一覧",
);

export default function ArticlesPage() {
  const articles = getAllArticles();
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));

  return (
    <main className="min-h-screen bg-pn-bg">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          分析記事
        </h1>

        {/* クイズ導線バナー */}
        <div className="bg-pn-blue-light border border-pn-blue-light rounded p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pn-navy">クイズで腕試し！</p>
            <p className="text-xs text-pn-navy mt-1">
              プレミアリーグクイズに挑戦してみよう
            </p>
          </div>
          <Link
            href="/articles/quiz"
            className="text-sm text-pn-blue font-medium hover:underline shrink-0"
          >
            挑戦する →
          </Link>
        </div>

        <ArticlesView articles={articles} allTags={allTags} />
      </div>
    </main>
  );
}
