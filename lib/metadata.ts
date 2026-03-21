import type { Metadata } from "next";

/**
 * PremierNow 各ページ共通の Metadata オブジェクトを生成する。
 *
 * @param title        - ページタイトル（`<title>` + OG title）
 * @param desc         - ページ説明（`<meta description>` + OG description）
 * @param url          - ページの相対パス（例: "/standings"）
 * @param ogImageTitle - OG 画像に使うタイトル（省略時は title を使用）
 * @param type         - OG type（省略時は "website"）
 * @param staticImage  - 固定 OG 画像パス（指定時は自動生成を使わない）
 */
export function createMetadata(
  title: string,
  desc: string,
  url: string,
  ogImageTitle?: string,
  type: "website" | "article" | "profile" = "website",
  staticImage?: string,
): Metadata {
  const imageTitle = ogImageTitle ?? title;
  const ogImage = staticImage ?? `/api/og?title=${encodeURIComponent(imageTitle)}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "PremierNow",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "ja_JP",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}
