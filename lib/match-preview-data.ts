/**
 * 次の注目カード — 静的設定ファイル
 *
 * ※ けが人・出場停止情報は試合直前に手動で更新してください。
 *    football-data.org 無料プランでは負傷者情報は提供されないため静的管理です。
 */

export type InjuryInfo = {
  /** 選手名（日本語） */
  playerName: string;
  /** 負傷箇所 or 累積警告など */
  reason: string;
  /** injury = けが / suspension = 出場停止 */
  status: "injury" | "suspension";
  /** 復帰予定（例: "4月上旬"・"未定"・"シーズン終了"） */
  returnDate?: string;
};

export type FeaturedMatchConfig = {
  /** URL パラメータ用 ID（例: "liverpool-vs-brighton"） */
  matchId: string;
  homeTeam: {
    /** football-data.org チーム ID */
    id: number;
    name: string;
    shortName: string;
    crest: string;
    injuries: InjuryInfo[];
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
    injuries: InjuryInfo[];
  };
  /** UTC 日時（ISO 8601） */
  utcDate: string;
  matchday: number;
  venue: string;
  /** /quiz/[matchId] の matchId に対応 */
  quizSlug: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// 次の注目カード設定
// ─────────────────────────────────────────────────────────────────────────────

export const FEATURED_MATCH: FeaturedMatchConfig = {
  matchId: "liverpool-vs-brighton",
  homeTeam: {
    id: 64,
    name: "Liverpool FC",
    shortName: "Liverpool",
    crest: "https://crests.football-data.org/64.png",
    injuries: [
      {
        playerName: "ディオゴ・ジョタ",
        reason: "太もも",
        status: "injury",
        returnDate: "未定",
      },
      {
        playerName: "コナー・ブラッドリー",
        reason: "膝",
        status: "injury",
        returnDate: "未定",
      },
    ],
  },
  awayTeam: {
    id: 397,
    name: "Brighton & Hove Albion FC",
    shortName: "Brighton",
    crest: "https://crests.football-data.org/397.png",
    injuries: [
      {
        playerName: "ソリー・マーチ",
        reason: "膝（ACL）",
        status: "injury",
        returnDate: "シーズン終了",
      },
      {
        playerName: "ヤン・パウル・ファン・ヘッケ",
        reason: "ハムストリング",
        status: "injury",
        returnDate: "未定",
      },
      {
        playerName: "タリク・ランプティ",
        reason: "累積警告（5枚）",
        status: "suspension",
      },
    ],
  },
  utcDate: "2026-03-22T15:00:00Z",
  matchday: 30,
  venue: "Anfield",
  quizSlug: "liverpool-vs-brighton",
};
