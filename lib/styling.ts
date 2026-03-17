/**
 * スタイリング用ユーティリティ
 */

/** 順位帯ごとの左ボーダークラス（CL / EL / CONF / 降格） */
export function getZoneBorder(position: number): string {
  if (position <= 4) return "border-l-4 border-blue-500";
  if (position === 5) return "border-l-4 border-orange-400";
  if (position === 6) return "border-l-4 border-orange-200";
  if (position >= 18) return "border-l-4 border-red-500";
  return "border-l-4 border-transparent";
}

/** 順位バッジの Tailwind クラス（1〜3位のみ色付き） */
export function getRankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-amber-400 text-white";
  if (rank === 2) return "bg-gray-300 text-gray-600";
  if (rank === 3) return "bg-amber-700 text-white";
  return "";
}
