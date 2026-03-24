import type { Metadata } from "next";
import Link from "next/link";
import { quizzes } from "@/lib/quiz-data";

export const metadata: Metadata = {
  title: "プレミアリーグ クイズ | PremierNow",
  description: "PLの知識を試すクイズ。4択と記述式の混合クイズに挑戦！",
  openGraph: {
    title: "プレミアリーグ クイズ | PremierNow",
    description: "PLの知識を試すクイズ。4択と記述式の混合クイズに挑戦！",
    url: "/articles/quiz",
    siteName: "PremierNow",
    locale: "ja_JP",
    type: "website",
  },
};

export default function QuizListPage() {
  return (
    <main className="min-h-screen bg-pn-bg dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
          PLクイズ
        </h1>
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const choiceCount = quiz.questions.filter(
              (q) => q.type === "choice"
            ).length;
            const textCount = quiz.questions.filter(
              (q) => q.type === "text"
            ).length;
            const mixedLabel =
              choiceCount > 0 && textCount > 0
                ? "4択+記述混在"
                : choiceCount > 0
                ? "4択"
                : "記述式";

            return (
              <div
                key={quiz.slug}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {quiz.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {quiz.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-pn-blue-light dark:bg-blue-900/40 text-pn-navy dark:text-blue-300 border border-pn-blue-light dark:border-blue-700/50 px-2 py-0.5 rounded">
                        全{quiz.questions.length}問
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {mixedLabel}
                      </span>
                      {quiz.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-400 dark:text-gray-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/articles/quiz/${quiz.slug}`}
                    className="shrink-0 text-sm bg-pn-navy text-white px-4 py-2 rounded hover:bg-pn-navy-dark transition-colors"
                  >
                    挑戦する →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
