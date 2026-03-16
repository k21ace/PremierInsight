import type { Metadata } from "next";
import { getMatches, getCurrentMatchday } from "@/lib/football-api";
import MatchesView from "./MatchesView";
import { JsonLd } from "@/components/JsonLd";

const OG_TITLE = "プレミアリーグ 試合結果・日程 2025-26 | PremierNow";
const OG_DESC =
  "プレミアリーグの最新試合結果と今後の日程。得点者・スコアをリアルタイムで確認。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/matches",
    siteName: "PremierNow",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ 試合結果・日程 2025-26")}`,
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
      `/api/og?title=${encodeURIComponent("プレミアリーグ 試合結果・日程 2025-26")}`,
    ],
  },
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string }>;
}) {
  const { matchday: matchdayParam } = await searchParams;

  // matchdayParam が有効な整数なら使用、なければ現在の節を取得
  const parsed = matchdayParam ? parseInt(matchdayParam, 10) : NaN;
  const selectedMatchday = !isNaN(parsed)
    ? Math.max(1, Math.min(38, parsed))
    : await getCurrentMatchday();

  const data = await getMatches({ matchday: selectedMatchday });

  return (
    <main className="min-h-screen bg-pn-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: "https://premiernow.jp" },
            { "@type": "ListItem", position: 2, name: "試合結果・日程", item: "https://premiernow.jp/matches" },
          ],
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          試合結果・日程
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.resultSet.first.slice(0, 4)}–{data.resultSet.last.slice(2, 4)}
          </span>
        </h1>
        <MatchesView
          matches={data.matches}
          matchday={selectedMatchday}
        />
      </div>
    </main>
  );
}
