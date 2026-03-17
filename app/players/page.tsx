import { getScorers } from "@/lib/football-api";
import { playerSNSData } from "@/lib/mock/player-sns";
import type { PlayerSNS } from "@/lib/mock/player-sns";
import { JsonLd } from "@/components/JsonLd";
import PlayersView from "./PlayersView";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "プレミアリーグ 選手スタッツ一覧 2025-26 | PremierNow",
  "プレミアリーグ全選手の得点・アシスト・出場時間ランキング。",
  "/players",
  "プレミアリーグ 選手スタッツ一覧 2025-26",
);

export default async function PlayersPage() {
  const data = await getScorers();

  // SNSデータを player.id をキーとしたマップに変換
  const snsMap: Record<number, PlayerSNS> = {};
  for (const entry of playerSNSData) {
    snsMap[entry.playerId] = entry;
  }

  return (
    <main className="min-h-screen bg-pn-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ホーム",
              item: "https://premiernow.jp",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "選手スタッツ",
              item: "https://premiernow.jp/players",
            },
          ],
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-6">
          選手スタッツ
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.season.startDate.slice(0, 4)}–{data.season.endDate.slice(2, 4)}
          </span>
        </h1>

        <PlayersView initialScorers={data.scorers} snsMap={snsMap} />
      </div>
    </main>
  );
}
