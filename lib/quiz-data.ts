export type QuizQuestion = {
  id: number;
  question: string;
  type: "choice" | "text";
  options?: string[];
  correctAnswer: string;
  explanation: string;
};

export type Quiz = {
  slug: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  publishedAt: string;
  tags: string[];
};

export const quizzes: Quiz[] = [
  {
    slug: "2025-26-season-quiz",
    title: "2025-26プレミアリーグ 今シーズンクイズ",
    description:
      "今シーズンのプレミアリーグをどれだけ知っている？全5問に挑戦！",
    publishedAt: "2026-03-16",
    tags: ["2025-26", "今シーズン", "クイズ"],
    questions: [
      {
        id: 1,
        question: "第30節終了時点の首位チームはどこ？",
        type: "choice",
        options: ["Arsenal", "Liverpool", "Man City", "Chelsea"],
        correctAnswer: "0",
        explanation:
          "アーセナルは70勝点で首位をキープしています。",
      },
      {
        id: 2,
        question:
          "今シーズンの得点王（第30節時点）の選手名をフルネームで答えてください",
        type: "text",
        correctAnswer: "Erling Haaland",
        explanation:
          "ハーランドは22得点で得点王争いをリードしています。",
      },
      {
        id: 3,
        question: "今シーズン最多得点チームはどこ？（第30節時点）",
        type: "choice",
        options: ["Arsenal", "Chelsea", "Man City", "Liverpool"],
        correctAnswer: "0",
        explanation: "アーセナルは61得点でリーグトップです。",
      },
      {
        id: 4,
        question:
          "第30節時点でアーセナルとマンCの勝点差は何点？（数字で）",
        type: "text",
        correctAnswer: "9",
        explanation:
          "アーセナル70勝点、マンC61勝点で9点差です。",
      },
      {
        id: 5,
        question: "今シーズン降格圏（18位以下）のチームはどれ？（第30節時点）",
        type: "choice",
        options: [
          "Leeds United",
          "Nottingham Forest",
          "West Ham",
          "Burnley",
        ],
        correctAnswer: "3",
        explanation:
          "バーンリーは20勝点で降格圏に位置しています。",
      },
    ],
  },
];

export function getQuizBySlug(slug: string): Quiz | undefined {
  return quizzes.find((q) => q.slug === slug);
}
