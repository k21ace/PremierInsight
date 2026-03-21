/**
 * 試合別クイズデータ
 * /quiz/[matchId] ページで使用
 */

import type { QuizQuestion } from "@/lib/quiz-data";

export type MatchQuiz = {
  matchId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export const matchQuizzes: MatchQuiz[] = [
  {
    matchId: "liverpool-vs-brighton",
    title: "リバプール vs ブライトン 直前クイズ",
    description:
      "アンフィールドの一戦を前に、両チームの歴史・選手・対戦成績をチェック！全5問に挑戦。",
    questions: [
      {
        id: 1,
        question:
          "三苫薫のプレミアリーグ通算・対リバプール戦における得点数は？（2025-26シーズン第29節終了時点）",
        type: "choice",
        options: ["0点", "1点", "2点", "3点"],
        correctAnswer: "1",
        explanation:
          "三苫薫はリバプール戦で1ゴールを記録しています。得意のドリブル突破からチャンスを多く作り出し、アンフィールドでも存在感を発揮してきました。",
      },
      {
        id: 2,
        question: "ブライトンがプレミアリーグで達成した歴代最高順位は？",
        type: "choice",
        options: ["4位", "5位", "6位", "7位"],
        correctAnswer: "2",
        explanation:
          "ブライトンは2022-23シーズン、ロベルト・デ・ゼルビ監督のもとで6位を達成し、クラブ史上初のヨーロッパリーグ出場権を獲得しました。",
      },
      {
        id: 3,
        question: "三苫薫がプロキャリアをスタートさせた日本のJリーグクラブは？",
        type: "choice",
        options: ["浦和レッズ", "鹿島アントラーズ", "川崎フロンターレ", "セレッソ大阪"],
        correctAnswer: "2",
        explanation:
          "三苫薫は川崎フロンターレでプロデビューし、J1リーグで頭角を現しました。2021年にブライトンへ移籍後、ベルギーのユニオン・サン＝ジロワーズへローンを経て、2022年に完全移籍しています。",
      },
      {
        id: 4,
        question:
          "プレミアリーグでのリバプール対ブライトン直接対決（全試合）において、より多く勝利しているのは？",
        type: "choice",
        options: ["リバプール", "ブライトン", "引き分けが最多", "同数"],
        correctAnswer: "0",
        explanation:
          "プレミアリーグでの通算対戦成績はリバプールが優勢です。ただし近年のブライトンは内容・結果ともに善戦しており、差は縮まっています。",
      },
      {
        id: 5,
        question: "リバプールのホームスタジアム「アンフィールド」の現在の収容人数は（概数）？",
        type: "choice",
        options: ["約45,000人", "約53,000人", "約61,000人", "約74,000人"],
        correctAnswer: "2",
        explanation:
          "増築が進んだアンフィールドの収容人数は約61,000人となりました。ヨーロッパ屈指の雰囲気を誇るスタジアムで、アウェイチームには難しい環境です。",
      },
    ],
  },
];

export function getMatchQuiz(matchId: string): MatchQuiz | undefined {
  return matchQuizzes.find((q) => q.matchId === matchId);
}
