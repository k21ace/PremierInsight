import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ReactNode } from "react";

// ─── カスタムコンポーネント ────────────────────────────────

type MatchInfoProps = {
  home: string;
  away: string;
  date: string;
  stadium: string;
  matchday: number | string;
};

function MatchInfo({ home, away, date, stadium, matchday }: MatchInfoProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 my-6">
      <p className="text-xl font-bold text-center text-gray-900 mb-3">
        {home} <span className="text-gray-400 font-normal">vs</span> {away}
      </p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-500">
        <span>📅 {date}</span>
        <span>🏟 {stadium}</span>
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">
          第{matchday}節
        </span>
      </div>
    </div>
  );
}

type HighlightProps = {
  type: "info" | "warning" | "tip";
  children: ReactNode;
};

const highlightStyles = {
  info: "bg-blue-50 border-l-4 border-blue-500 text-blue-900",
  warning: "bg-orange-50 border-l-4 border-orange-500 text-orange-900",
  tip: "bg-violet-50 border-l-4 border-violet-500 text-violet-900",
};

function Highlight({ type, children }: HighlightProps) {
  return (
    <div className={`${highlightStyles[type]} p-4 rounded-r my-4 text-sm leading-relaxed`}>
      {children}
    </div>
  );
}

type PlayerCardProps = {
  name: string;
  team: string;
  number?: string;
  point: string;
  children: ReactNode;
};

const teamBorderColor: Record<string, string> = {
  Liverpool: "border-l-4 border-red-500",
  Brighton: "border-l-4 border-blue-400",
};

function PlayerCard({ name, team, point, children }: PlayerCardProps) {
  const borderClass = teamBorderColor[team] ?? "border-l-4 border-gray-300";
  return (
    <div className={`bg-white border border-gray-200 rounded p-4 mb-4 ${borderClass}`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-bold text-gray-900">{name}</span>
        <span className="text-gray-500 text-sm">{team}</span>
      </div>
      <span className="inline-block bg-yellow-50 text-yellow-800 text-xs px-2 py-1 rounded mt-1 mb-2">
        {point}
      </span>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

type ScorePredictionProps = {
  home: string;
  away: string;
  homeScore: number | string;
  awayScore: number | string;
  reason: string;
};

function ScorePrediction({ home, away, homeScore, awayScore, reason }: ScorePredictionProps) {
  // MDX から string として渡される場合があるため Number() で正規化
  const hs = Number(homeScore);
  const as = Number(awayScore);
  return (
    <div className="bg-violet-600 text-white rounded p-6 text-center my-6">
      <p className="text-sm text-violet-200 mb-2">スコア予想</p>
      <p className="text-lg font-medium mb-1">
        {home} <span className="text-violet-300">vs</span> {away}
      </p>
      <p className="text-4xl font-bold font-mono tabular-nums my-3">
        {hs} - {as}
      </p>
      <p className="text-sm text-violet-100 mt-3 leading-relaxed">{reason}</p>
    </div>
  );
}

type CharacterCommentProps = {
  children: ReactNode;
};

function CharacterComment({ children }: CharacterCommentProps) {
  return (
    <div className="flex items-start gap-3 my-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs shrink-0">
        レオ
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 leading-relaxed relative">
        {children}
      </div>
    </div>
  );
}

// ─── MDX コンポーネントマップ ──────────────────────────────

const mdxComponents: MDXComponents = {
  // 見出し
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">{children}</h3>
  ),
  // テキスト
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  // リスト
  ul: ({ children }) => (
    <ul className="text-gray-700 leading-relaxed mb-4 pl-6 list-disc">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-gray-700 leading-relaxed mb-4 pl-6 list-decimal">{children}</ol>
  ),
  // テーブル（remark-gfm）
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 text-gray-600">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-100">{children}</tbody>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left px-3 py-2 font-medium border-b border-gray-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-gray-700">{children}</td>
  ),
  // その他
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-violet-300 pl-4 text-gray-600 italic my-4">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? "#"}
      className="text-violet-600 hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  ),
  // カスタムコンポーネント
  MatchInfo,
  Highlight,
  PlayerCard,
  ScorePrediction,
  CharacterComment,
};

export default mdxComponents;
