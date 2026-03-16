import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlayer, getScorers } from "@/lib/football-api";
import { getPlayerSNS } from "@/lib/mock/player-sns";
import { getPlayerDetailStatsAll } from "@/lib/mock/player-stats";
import { getPlayerCareer } from "@/lib/mock/player-career";
import { JsonLd } from "@/components/JsonLd";
import PlayerDetailClient from "./PlayerDetailClient";
import type { Scorer } from "@/types/football";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const playerId = Number(id);
  if (isNaN(playerId)) return {};

  try {
    const player = await getPlayer(playerId);
    const title = `${player.name} スタッツ 2025-26 | PremierNow`;
    const description = `${player.name}（${player.currentTeam?.shortName ?? ""}）の得点・アシスト・シュート・パスなど詳細スタッツ。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/players/${id}`,
        siteName: "PremierNow",
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(player.name + " スタッツ 2025-26")}`,
            width: 1200,
            height: 630,
          },
        ],
        locale: "ja_JP",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          `/api/og?title=${encodeURIComponent(player.name + " スタッツ 2025-26")}`,
        ],
      },
    };
  } catch {
    return {};
  }
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const playerId = Number(id);

  if (isNaN(playerId)) notFound();

  // 選手詳細取得（存在しなければ 404）
  let player;
  try {
    player = await getPlayer(playerId);
  } catch {
    notFound();
  }

  // 3シーズン分のスコアラーデータを並列取得
  const [s2025, s2024, s2023] = await Promise.all([
    getScorers(2025),
    getScorers(2024),
    getScorers(2023),
  ]);

  const find = (scorers: Scorer[]): Scorer | null =>
    scorers.find((s) => s.player.id === playerId) ?? null;

  const seasonData: Record<number, Scorer | null> = {
    2025: find(s2025.scorers),
    2024: find(s2024.scorers),
    2023: find(s2023.scorers),
  };

  // モックデータ（同期）
  const snsData = getPlayerSNS(playerId);
  const detailStatsAll = getPlayerDetailStatsAll(playerId);
  const career = getPlayerCareer(playerId);

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
              name: "Player",
              item: "https://premiernow.jp/players",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: player.name,
              item: `https://premiernow.jp/players/${id}`,
            },
          ],
        }}
      />

      <PlayerDetailClient
        player={player}
        playerId={playerId}
        seasonData={seasonData}
        snsData={snsData}
        detailStatsAll={detailStatsAll}
        career={career}
      />
    </main>
  );
}
