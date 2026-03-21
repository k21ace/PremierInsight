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
  relatedArticleSlug?: string;
};

export const quizzes: Quiz[] = [
  {
    slug: "brighton-vs-liverpool",
    title: "ブライトン vs リバプール 直前クイズ",
    description:
      "ブライトン対リバプールの対戦成績・三苫薫・歴史を問う全6問！試合前に挑戦しよう。",
    publishedAt: "2026-03-21",
    tags: ["ブライトン", "リバプール", "三苫薫", "プレビュー"],
    relatedArticleSlug: "matchpreview-matchday31-brighton-liverpool",
    questions: [
      {
        id: 1,
        question: "プレミアリーグでブライトンとリバプールの直近5試合の対戦成績（ブライトン視点）は？",
        type: "choice",
        options: ["2勝2分1敗", "1勝1分3敗", "3勝0分2敗", "0勝2分3敗"],
        correctAnswer: "1",
        explanation:
          "直近5試合ではリバプールが優勢で、ブライトンは1勝1分3敗です。",
      },
      {
        id: 2,
        question: "ブライトンの現在の監督名は？",
        type: "choice",
        options: [
          "Fabian Hürzeler",
          "Roberto De Zerbi",
          "Graham Potter",
          "Chris Hughton",
        ],
        correctAnswer: "0",
        explanation:
          "ファビアン・ヒュルツェラーが2024-25シーズンからブライトンの監督を務めています。",
      },
      {
        id: 3,
        question: "ブライトンのホームスタジアムの名称は？",
        type: "choice",
        options: [
          "Falmer Stadium",
          "Amex Stadium",
          "Withdean Stadium",
          "Brighton Arena",
        ],
        correctAnswer: "1",
        explanation:
          "アメックス・スタジアム（正式名称：American Express Community Stadium）がブライトンのホームです。",
      },
      {
        id: 4,
        question: "リバプールの今シーズンプレミアリーグ公式戦の最多得点はいくつでしょうか？",
        type: "choice",
        options: ["4", "5", "6", "7"],
        correctAnswer: "1",
        explanation:
          "ウェストハムに5-2で勝利しています。",
      },
      {
        id: 5,
        question: "ブライトンの中盤を支えるあるベテラン選手は、かつてリバプールに長年所属し、多くのタイトル獲得に貢献しました。今節、彼は古巣リバプールを迎え撃つことになります。その選手は誰？",
        type: "choice",
        options: [
          "ファン・ヘッケ",
          "ジェームズ・ミルナー",
          "ダニー・ウェルベック",
          "パスカル・グロス",
        ],
        correctAnswer: "1",
        explanation:
          "ミルナーにとってリバプールは「伝説」を作った古巣。現在はブライトンの若手たちの手本として、中盤やサイドバックでマルチな活躍を見せています。",
      },
      {
        id: 6,
        question: "三苫薫の今シーズン（2025-26）のプレミアリーグ公式戦アシスト数は1ですが、xA（アシスト期待値）はいくつでしょう？（第30節時点）",
        type: "choice",
        options: ["0.7", "1.5", "2.2", "3.1"],
        correctAnswer: "2",
        explanation:
          "三苫薫は今シーズンのxA（アシスト期待値）は2.20となっています。",
      },
    ],
  },
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
