import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { matchQuizzes, getMatchQuiz } from "@/lib/match-quiz-data";
import QuizClient from "@/app/articles/quiz/[slug]/QuizClient";
import type { Quiz } from "@/lib/quiz-data";

type Props = { params: Promise<{ matchId: string }> };

export async function generateStaticParams() {
  return matchQuizzes.map((q) => ({ matchId: q.matchId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  const quiz = getMatchQuiz(matchId);
  if (!quiz) return {};
  return {
    title: `${quiz.title} | PremierNow`,
    description: quiz.description,
    openGraph: {
      title: `${quiz.title} | PremierNow`,
      description: quiz.description,
      url: `/quiz/${matchId}`,
      siteName: "PremierNow",
      locale: "ja_JP",
      type: "website",
    },
  };
}

export default async function MatchQuizPage({ params }: Props) {
  const { matchId } = await params;
  const matchQuiz = getMatchQuiz(matchId);
  if (!matchQuiz) notFound();

  // QuizClient は Quiz 型を受け取るため変換
  const quiz: Quiz = {
    slug: matchQuiz.matchId,
    title: matchQuiz.title,
    description: matchQuiz.description,
    questions: matchQuiz.questions,
    publishedAt: new Date().toISOString().split("T")[0],
    tags: ["マッチプレビュー", "クイズ"],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← トップへ戻る
          </Link>
        </div>

        {/* マッチラベル */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
            マッチプレビュークイズ
          </span>
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
