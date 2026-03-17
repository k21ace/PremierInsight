/**
 * 表示フォーマット用ユーティリティ
 */

/** 名前からイニシャル2文字を生成（例: "Erling Haaland" → "EH"） */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** 得失点差を +n 形式で表示（例: 5 → "+5", -3 → "-3"） */
export function formatGD(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}
