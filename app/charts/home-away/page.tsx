import type { Metadata } from "next";
import { getHomeAwayStandings } from "@/lib/football-api";
import { calcHomeAwayStats } from "@/lib/chart-utils";
import { JsonLd } from "@/components/JsonLd";
import HomeAwayClient from "./HomeAwayClient";

export const revalidate = 3600;

const OG_TITLE =
  "プレミアリーグ ホーム vs アウェイ 成績比較 2025-26 | PremierInsight";
const OG_DESC =
  "プレミアリーグ全チームのホームとアウェイの成績を比較。ホームに強いチーム・アウェイに強いチームの傾向が一目でわかります。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/charts/home-away",
    siteName: "PremierInsight",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("ホーム vs アウェイ 成績比較 2025-26")}`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [
      `/api/og?title=${encodeURIComponent("ホーム vs アウェイ 成績比較 2025-26")}`,
    ],
  },
};

export default async function HomeAwayPage() {
  const { home, away } = await getHomeAwayStandings();
  const stats = calcHomeAwayStats(home, away);

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ホーム",
              item: "https://premier-insight.vercel.app",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "分析",
              item: "https://premier-insight.vercel.app/charts/race",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "H/A比較",
              item: "https://premier-insight.vercel.app/charts/home-away",
            },
          ],
        }}
      />

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          ホーム vs アウェイ 成績比較
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ホームとアウェイで成績に差があるチームを分析します。
          差が大きいチームほどホームの雰囲気に影響されやすい傾向があります。
        </p>
      </div>

      <HomeAwayClient stats={stats} />
    </main>
  );
}
