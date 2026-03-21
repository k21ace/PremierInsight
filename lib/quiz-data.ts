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
    slug: "everton-vs-chelsea",
    title: "エバートン vs チェルシー 直前クイズ",
    description:
      "新スタジアムで迎える因縁の一戦。エバートン対チェルシーの対戦成績・歴史・選手を問う全6問！",
    publishedAt: "2026-03-28",
    tags: ["エバートン", "チェルシー", "プレビュー", "第32節"],
    relatedArticleSlug: "matchpreview-matchday32-everton-chelsea",
    questions: [
      {
        id: 1,
        question: "エバートンとチェルシーのプレミアリーグ直近5試合の対戦成績（エバートン視点）は？",
        type: "choice",
        options: ["1勝1分3敗", "2勝1分2敗", "0勝2分3敗", "3勝0分2敗"],
        correctAnswer: "0",
        explanation:
          "直近5試合ではチェルシーが優勢で、エバートンは1勝1分3敗です。",
      },
      {
        id: 2,
        question: "チェルシーの現在の監督は誰？",
        type: "choice",
        options: [
          "Liam Rosenior",
          "Mauricio Pochettino",
          "Frank Lampard",
          "Enzo Maresca",
        ],
        correctAnswer: "0",
        explanation:
          "リアム・ローゼナーは2026年1月からチェルシーの監督を務めています。マレスカの後任として就任しました。",
      },
      {
        id: 3,
        question: "エバートンのホームスタジアム「グッディソン・パーク」が開場したのはいつ？",
        type: "choice",
        options: ["1892年", "1901年", "1910年", "1888年"],
        correctAnswer: "0",
        explanation:
          "グッディソン・パークは1892年に開場し、世界初の目的建設型フットボール専用スタジアムのひとつです。2024-25シーズンをもって132年の歴史に幕を閉じました。",
      },
      {
        id: 4,
        question: "エバートンが2025-26シーズンから移転した新スタジアムの場所は？",
        type: "choice",
        options: [
          "ブラムリー・ムーア・ドック",
          "ウォーレル・パーク",
          "アンフィールド・ロード",
          "グッディソン・パーク",
        ],
        correctAnswer: "0",
        explanation:
          "エバートンは2025-26シーズンよりブラムリー・ムーア・ドックに建設された新スタジアムに移転しました。グッディソン・パークでの132年の歴史に幕を閉じました。",
      },
      {
        id: 5,
        question: "コール・パーマーの今シーズン（2025-26）プレミアリーグの得点数は？（第31節時点）",
        type: "choice",
        options: ["7", "9", "11", "13"],
        correctAnswer: "1",
        explanation:
          "コール・パーマーは今シーズン第31節時点で9得点を記録しています。",
      },
      {
        id: 6,
        question: "チェルシーが保持するプレミアリーグ1シーズン最多勝利数の記録は何勝？（2005-06シーズン）",
        type: "choice",
        options: ["29勝", "30勝", "31勝", "32勝"],
        correctAnswer: "0",
        explanation:
          "チェルシーは2005-06シーズンに29勝を記録し、当時の最多勝利数記録を樹立しました（後にマンチェスター・シティが更新）。",
      },
    ],
  },
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
    title: "2025-26プレミアリーグ 知識クイズ（第30節時点）",
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
        question: "今シーズンの得点王（第30節時点）は誰？",
        type: "choice",
        options: [
          "Erling Haaland",
          "Mohamed Salah",
          "Cole Palmer",
          "Alexander Isak",
        ],
        correctAnswer: "0",
        explanation:
          "ハーランドは22得点で得点王争いをリードしています。",
      },
      {
        id: 3,
        question: "2025-26シーズン中に監督交代があったチームは何クラブ？（第30節時点）",
        type: "choice",
        options: ["4", "5", "6", "8"],
        correctAnswer: "2",
        explanation:
          "チェルシー（マレスカ→ローゼナー）など、第30節時点で6クラブが今シーズン中に監督を交代しています。",
      },
      {
        id: 4,
        question: "第30節時点でアーセナルとマンCの勝点差は何点？",
        type: "choice",
        options: ["6", "7", "9", "11"],
        correctAnswer: "2",
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
