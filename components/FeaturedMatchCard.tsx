import Link from "next/link";
import { FormBadges } from "@/components/ui/ResultBadge";
import { convertToJSTMedium } from "@/lib/utils";
import type { FeaturedMatchConfig, InjuryInfo } from "@/lib/match-preview-data";
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
              inj.status === "suspension" ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">{inj.playerName}</span>
            <span className="text-gray-400 ml-1">
              {inj.reason}
              {inj.returnDate ? `（${inj.returnDate}）` : ""}
            </span>
          </div>
        </div>
      ))}
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
  const { homeTeam, awayTeam, utcDate, matchday, venue, quizSlug } = config;

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
      {/* ── ヘッダー ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-violet-600 rounded inline-block" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">次の注目カード</p>
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
        </div>

        {/* ── クイズリンク ── */}
        <Link
          href={`/articles/quiz/${quizSlug}`}
          className="flex items-center justify-between w-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-700/50 rounded px-4 py-3 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors group"
        >
          <div>
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
              この試合のクイズに挑戦 →
            </p>
            <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">
              過去の対戦成績・データなど　全6問
            </p>
          </div>
          <span className="text-violet-400 text-xl group-hover:translate-x-0.5 transition-transform">
            ❓
          </span>
        </Link>
      </div>
    </section>
  );
}
