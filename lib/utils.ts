/**
 * 汎用ユーティリティ関数
 */

/**
 * UTC形式の日時文字列を JST（UTC+9）の表示文字列に変換する。
 *
 * @param utcDate - ISO 8601 形式の UTC 日時（例: "2025-08-16T14:00:00Z"）
 * @returns JST の日時文字列（例: "2025年8月16日(土) 23:00"）
 *
 * @example
 * convertToJST("2025-08-16T14:00:00Z")
 * // => "2025年8月16日(土) 23:00"
 */
export function convertToJST(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * UTC形式の日時文字列を JST の短い表示文字列（月/日 HH:mm）に変換する。
 *
 * @param utcDate - ISO 8601 形式の UTC 日時
 * @returns JST の短い日時文字列（例: "8/16 23:00"）
 */
export function convertToJSTShort(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
