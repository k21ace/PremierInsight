import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { quizzes, getQuizBySlug } from "@/lib/quiz-data";
import QuizClient from "./QuizClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) return {};
  return {
    title: `${quiz.title} | PremierInsight`,
    description: quiz.description,
    openGraph: {
      title: `${quiz.title} | PremierInsight`,
      description: quiz.description,
      url: `/articles/quiz/${slug}`,
      siteName: "PremierInsight",
      locale: "ja_JP",
      type: "website",
    },
  };
}

export default async function QuizDetailPage({ params }: Props) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link
            href="/articles/quiz"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← クイズ一覧
          </Link>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">
          {quiz.title}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{quiz.description}</p>
        <QuizClient quiz={quiz} />
      </div>
    </main>
  );
}
