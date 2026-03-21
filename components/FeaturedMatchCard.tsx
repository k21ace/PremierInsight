import Link from "next/link";
import { FormBadges } from "@/components/ui/ResultBadge";
import { convertToJSTMedium } from "@/lib/utils";
import type { FeaturedMatchConfig, InjuryInfo, ScorePrediction } from "@/lib/match-preview-data";
import { quizzes } from "@/lib/quiz-data";
import type { Match } from "@/types/football";

type Props = {
  config: FeaturedMatchConfig;
  homeForm: string[];
  awayForm: string[];
  /** 直近5試合の結果（ホーム・アウェイ共通データ） */
  homeRecentMatches: RecentMatchRow[];
  awayRecentMatches: RecentMatchRow[];
};

export type RecentMatchRow = {
  opponent: string;
  opponentCrest: string | null;
  result: "W" | "D" | "L";
  score: string;
  isHome: boolean;
  utcDate: string;
};

/** 試合リストから特定チームの直近5試合を取得してフォーマット */
export function buildRecentMatches(
  teamId: number,
  matches: Match[],
): RecentMatchRow[] {
  return matches
    .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 5)
    .map((m) => {
      const isHome = m.homeTeam.id === teamId;
      const hg = m.score.fullTime.home ?? 0;
      const ag = m.score.fullTime.away ?? 0;
      let result: "W" | "D" | "L";
      if (hg === ag) result = "D";
      else if (isHome) result = hg > ag ? "W" : "L";
      else result = ag > hg ? "W" : "L";

      const opponent = isHome ? m.awayTeam : m.homeTeam;
      return {
        opponent: opponent.shortName,
        opponentCrest: opponent.crest ?? null,
        result,
        score: isHome ? `${hg}–${ag}` : `${ag}–${hg}`,
        isHome,
        utcDate: m.utcDate,
      };
    });
}

function InjuryTable({ injuries }: { injuries: InjuryInfo[] }) {
  if (injuries.length === 0) {
    return <p className="text-xs text-gray-400">報告なし</p>;
  }
  return (
    <div className="space-y-1">
      {injuries.map((inj, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span
            className={`mt-0.5 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              inj.returning
                ? "bg-green-500"
                : inj.status === "suspension"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">{inj.playerName}</span>
            <span className="text-gray-400 ml-1">
              {inj.reason}
              {inj.returnDate ? `（${inj.returnDate}）` : ""}
            </span>
            {inj.sourceUrl && (
              <a
                href={inj.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[10px] text-blue-400 hover:text-blue-500 hover:underline"
              >
                [出典]
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScorePredictionSection({
  prediction,
  homeShortName,
  awayShortName,
}: {
  prediction: ScorePrediction;
  homeShortName: string;
  awayShortName: string;
}) {
  const { homeGoals, awayGoals, homeWinPct, drawPct, awayWinPct, comment } = prediction;
  return (
    <div className="mb-5">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        スコア予想
      </p>
      {/* 予想スコア */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-gray-400">{homeShortName}</span>
          <span className="font-mono font-bold text-2xl text-gray-900 dark:text-gray-100 tabular-nums">
            {homeGoals}
          </span>
        </div>
        <span className="text-lg font-bold text-gray-300 dark:text-gray-600">–</span>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-gray-400">{awayShortName}</span>
          <span className="font-mono font-bold text-2xl text-gray-900 dark:text-gray-100 tabular-nums">
            {awayGoals}
          </span>
        </div>
      </div>
      {/* 勝敗確率バー */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-12 text-right text-gray-500 dark:text-gray-400 shrink-0">{homeShortName}</span>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${homeWinPct}%` }}
            />
          </div>
          <span className="w-8 font-mono tabular-nums text-gray-700 dark:text-gray-300 shrink-0">
            {homeWinPct}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-12 text-right text-gray-500 dark:text-gray-400 shrink-0">引分</span>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full"
              style={{ width: `${drawPct}%` }}
            />
          </div>
          <span className="w-8 font-mono tabular-nums text-gray-700 dark:text-gray-300 shrink-0">
            {drawPct}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-12 text-right text-gray-500 dark:text-gray-400 shrink-0">{awayShortName}</span>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${awayWinPct}%` }}
            />
          </div>
          <span className="w-8 font-mono tabular-nums text-gray-700 dark:text-gray-300 shrink-0">
            {awayWinPct}%
          </span>
        </div>
      </div>
      {comment && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{comment}</p>
      )}
    </div>
  );
}

function RecentMatchList({ rows }: { rows: RecentMatchRow[] }) {
  if (rows.length === 0) {
    return <p className="text-xs text-gray-400">データなし</p>;
  }
  return (
    <div className="space-y-1">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {/* W/D/L バッジ */}
          <span
            className={`inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-sm flex-shrink-0 ${
              row.result === "W"
                ? "bg-green-600 text-white"
                : row.result === "D"
                  ? "bg-gray-400 text-white"
                  : "bg-red-500 text-white"
            }`}
          >
            {row.result}
          </span>
          {/* 相手エンブレム */}
          {row.opponentCrest ? (
            <img
              src={row.opponentCrest}
              alt=""
              className="w-4 h-4 object-contain flex-shrink-0"
            />
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )}
          {/* H/A + 相手名 */}
          <span className="text-gray-400 flex-shrink-0">
            {row.isHome ? "H" : "A"}
          </span>
          <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{row.opponent}</span>
          {/* スコア */}
          <span className="font-mono tabular-nums text-gray-900 dark:text-gray-100 flex-shrink-0">
            {row.score}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedMatchCard({
  config,
  homeForm,
  awayForm,
  homeRecentMatches,
  awayRecentMatches,
}: Props) {
  const { homeTeam, awayTeam, utcDate, matchday, venue, quizSlug, previewArticleSlug } = config;
  const quizQuestionCount = quizzes.find((q) => q.slug === quizSlug)?.questions.length ?? 0;

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
      {/* ── ヘッダー ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-violet-600 rounded inline-block" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">注目カード</p>
        </div>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono tabular-nums">
          第{matchday}節
        </span>
      </div>

      {/* ── 対戦カード ── */}
      <div className="px-4 py-4">
        {/* 日時・会場 */}
        <p className="text-xs text-gray-400 text-center mb-3">
          {convertToJSTMedium(utcDate)}・{venue}
        </p>

        {/* チーム対決ヘッダー */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {/* ホーム */}
          <div className="flex flex-col items-center gap-1 w-[100px]">
            <img
              src={homeTeam.crest}
              alt={homeTeam.shortName}
              className="w-10 h-10 object-contain"
            />
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 text-center leading-tight">
              {homeTeam.shortName}
            </span>
          </div>

          <div className="text-sm font-bold text-gray-400">vs</div>

          {/* アウェイ */}
          <div className="flex flex-col items-center gap-1 w-[100px]">
            <img
              src={awayTeam.crest}
              alt={awayTeam.shortName}
              className="w-10 h-10 object-contain"
            />
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 text-center leading-tight">
              {awayTeam.shortName}
            </span>
          </div>
        </div>

        {/* ── スコア予想 ── */}
        {config.scorePrediction && (
          <ScorePredictionSection
            prediction={config.scorePrediction}
            homeShortName={homeTeam.shortName}
            awayShortName={awayTeam.shortName}
          />
        )}

        {/* ── フォーム比較 ── */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            直近5試合フォーム
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] text-gray-400">{homeTeam.shortName}</span>
              <FormBadges form={homeForm} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-gray-400">{awayTeam.shortName}</span>
              <FormBadges form={awayForm} />
            </div>
          </div>
        </div>

        {/* ── 直近試合詳細（2列） ── */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              {homeTeam.shortName} 直近5試合
            </p>
            <RecentMatchList rows={homeRecentMatches} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              {awayTeam.shortName} 直近5試合
            </p>
            <RecentMatchList rows={awayRecentMatches} />
          </div>
        </div>

        {/* ── けが人・出場停止（2列） ── */}
        <div className="grid grid-cols-2 gap-4 mb-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {homeTeam.shortName}
              </p>
            </div>
            <InjuryTable injuries={homeTeam.injuries} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {awayTeam.shortName}
              </p>
            </div>
            <InjuryTable injuries={awayTeam.injuries} />
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-3 mb-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            けが
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
            出場停止
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            復帰予定
          </span>
        </div>

        {/* ── クイズ・プレビュー記事リンク ── */}
        <div className="flex gap-2">
          <Link
            href={`/articles/quiz/${quizSlug}`}
            className="flex items-center justify-between flex-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-700/50 rounded px-3 py-3 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                クイズに挑戦 →
              </p>
              <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">
                {quizQuestionCount > 0 ? `全${quizQuestionCount}問` : "クイズ"}
              </p>
            </div>
            <span className="text-violet-400 text-xl group-hover:translate-x-0.5 transition-transform">
              ❓
            </span>
          </Link>
          <Link
            href={`/articles/${previewArticleSlug}`}
            className="flex items-center justify-between flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                マッチプレビュー →
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                試合展望・分析
              </p>
            </div>
            <span className="text-gray-400 text-xl group-hover:translate-x-0.5 transition-transform">
              📋
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
