/**
 * 注目カード — 静的設定ファイル
 *
 * ※ けが人・出場停止情報は試合直前に手動で更新してください。
 *    football-data.org 無料プランでは負傷者情報は提供されないため静的管理です。
 *
 * utcDate / venue / homeTeam / awayTeam は football-data.org API から自動取得します。
 * 更新時は homeTeamId / awayTeamId と injuries のみ変更してください。
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
  /** true の場合、この試合で復帰予定 */
  returning?: boolean;
  /** 情報ソースの URL */
  sourceUrl?: string;
};

/** football-data.org API から取得した試合データと injuries をマージした型（FeaturedMatchCard の Props） */
export type FeaturedMatchConfig = {
  /** URL パラメータ用 ID（例: "brighton-vs-liverpool"） */
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
  /** スコア予想 */
  scorePrediction?: ScorePrediction;
};

export type ScorePrediction = {
  /** ホームチームの予想得点 */
  homeGoals: number;
  /** アウェイチームの予想得点 */
  awayGoals: number;
  /** ホーム勝利確率（0〜100） */
  homeWinPct: number;
  /** 引き分け確率（0〜100） */
  drawPct: number;
  /** アウェイ勝利確率（0〜100） */
  awayWinPct: number;
  /** 予想の根拠・コメント */
  comment?: string;
};

/** 静的管理が必要な設定のみを保持する型 */
export type FeaturedMatchStaticConfig = {
  /** ホームチームの football-data.org チームID */
  homeTeamId: number;
  /** アウェイチームの football-data.org チームID */
  awayTeamId: number;
  /** /quiz/[slug] 用スラッグ */
  quizSlug: string;
  /** ホームチームの負傷者・出場停止情報 */
  homeInjuries: InjuryInfo[];
  /** アウェイチームの負傷者・出場停止情報 */
  awayInjuries: InjuryInfo[];
  /** スコア予想 */
  scorePrediction?: ScorePrediction;
};

// ─────────────────────────────────────────────────────────────────────────────
// 注目カード設定（手動更新が必要な項目のみ）
// utcDate / venue / チーム名 / エンブレムは API から自動取得されます
// ─────────────────────────────────────────────────────────────────────────────

export const FEATURED_MATCH_CONFIG: FeaturedMatchStaticConfig = {
  homeTeamId: 397, // Brighton & Hove Albion FC
  awayTeamId: 64,  // Liverpool FC
  quizSlug: "brighton-vs-liverpool",
  homeInjuries: [
    {
      playerName: "三苫薫",
      reason: "負傷",
      status: "injury",
      returning: true,
      returnDate: "この試合から復帰予定",
      sourceUrl: "https://www.sponichi.co.jp/soccer/news/2026/03/21/articles/20260321s00002021032000c.html",
    },
    {
      playerName: "アダム・ウェブスター",
      reason: "膝の負傷",
      status: "injury",
      returnDate: "4月上旬",
    },
    {
      playerName: "ステファノス・チマス",
      reason: "十字靭帯の負傷",
      status: "injury",
      returnDate: "8月上旬",
    },
  ],
  awayInjuries: [
    {
      playerName: "ジョー・ゴメス",
      reason: "軽い外傷",
      status: "injury",
      returnDate: "未定",
    },
    {
      playerName: "アリソン・ベッカー",
      reason: "筋肉損傷",
      status: "injury",
      returnDate: "4月上旬",
    },
    {
      playerName: "コナー・ブラッドリー",
      reason: "膝の負傷",
      status: "injury",
      returnDate: "今季復帰なし",
    },
    {
      playerName: "ジョバンニ・レオーニ",
      reason: "十字靭帯の負傷",
      status: "injury",
      returnDate: "8月上旬",
    },
    {
      playerName: "ステファン・バイチェティッチ",
      reason: "ハムストリング損傷",
      status: "injury",
      returnDate: "5月上旬",
    },
    {
      playerName: "遠藤航",
      reason: "足首の骨折",
      status: "injury",
      returnDate: "5月上旬",
    },
    {
      playerName: "アレクサンダー・イサク",
      reason: "脚の骨折",
      status: "injury",
      returnDate: "4月中旬",
    },
    {
      playerName: "モハメド・サラー",
      reason: "筋肉損傷",
      status: "injury",
      returnDate: "この試合は欠場",
      sourceUrl: "https://lscj.seesaa.net/article/520252219.html",
    },
  ],
  scorePrediction: {
    homeGoals: 1,
    awayGoals: 2,
    homeWinPct: 25,
    drawPct: 22,
    awayWinPct: 53,
    comment: "首位リバプールが安定した守備とカウンターで制する。サラー欠場もジョタがフォローか。三苫の復帰がブライトンの鍵。",
  },
};
