import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import mdxComponents from "@/components/mdx/MdxComponents";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = getArticleBySlug(slug);
    const title = `${article.title} | PremierInsight`;
    const ogImage = `/api/og?title=${encodeURIComponent(article.title)}`;
    return {
      title,
      description: article.description,
      openGraph: {
        title,
        description: article.description,
        url: `/articles/${slug}`,
        siteName: "PremierInsight",
        images: [{ url: ogImage, width: 1200, height: 630 }],
        locale: "ja_JP",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: article.description,
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = getArticleBySlug(slug);
  } catch {
    notFound();
  }

  // 前後記事を取得
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const prevArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const nextArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.publishedAt,
          publisher: {
            "@type": "Organization",
            name: "PremierInsight",
          },
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-3">
            {article.title}
          </h1>
          <p className="text-sm text-gray-500 mb-4">{article.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{article.publishedAt}</span>
            <span>{article.readingTime}</span>
            {article.matchday && <span>第{article.matchday}節</span>}
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 mb-6">
          <MDXRemote
            source={article.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* 前後ナビゲーション */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {prevArticle && (
              <Link
                href={`/articles/${prevArticle.slug}`}
                className="block bg-white border border-gray-200 rounded shadow-sm p-4 hover:border-gray-400 transition-colors"
              >
                <p className="text-xs text-gray-400 mb-1">← 前の記事</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {prevArticle.title}
                </p>
              </Link>
            )}
          </div>
          <div>
            {nextArticle && (
              <Link
                href={`/articles/${nextArticle.slug}`}
                className="block bg-white border border-gray-200 rounded shadow-sm p-4 hover:border-gray-400 transition-colors text-right"
              >
                <p className="text-xs text-gray-400 mb-1">次の記事 →</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {nextArticle.title}
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* 記事一覧へ */}
        <div className="mt-4 text-center">
          <Link href="/articles" className="text-sm text-violet-600 hover:underline">
            ← 記事一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
