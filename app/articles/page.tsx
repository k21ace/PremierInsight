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
    <main className="min-h-screen bg-pn-bg dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
          分析記事
        </h1>

        <ArticlesView articles={articles} allTags={allTags} />
      </div>
    </main>
  );
}
