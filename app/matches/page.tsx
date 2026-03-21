import { getMatches } from "@/lib/football-api";
import MatchesView from "./MatchesView";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "プレミアリーグ 試合結果・日程 2025-26 | PremierNow",
  "プレミアリーグの最新試合結果と今後の日程。得点者・スコアをリアルタイムで確認。",
  "/matches",
  "プレミアリーグ 試合結果・日程 2025-26",
);

export default async function MatchesPage() {
  const data = await getMatches();

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
        <MatchesView matches={data.matches} />
      </div>
    </main>
  );
}
