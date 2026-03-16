import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStandings } from "@/lib/football-api";
import { JsonLd } from "@/components/JsonLd";

const OG_TITLE = "プレミアリーグ チーム一覧 2025-26 | PremierNow";
const OG_DESC =
  "プレミアリーグ全20クラブの順位・勝点・スタッツ一覧。各チームの詳細成績を確認。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/teams",
    siteName: "PremierNow",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ チーム一覧 2025-26")}`,
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
      `/api/og?title=${encodeURIComponent("プレミアリーグ チーム一覧 2025-26")}`,
    ],
  },
};

function getZoneColor(position: number): string {
  if (position <= 4) return "border-l-4 border-blue-500";
  if (position === 5) return "border-l-4 border-orange-400";
  if (position === 6) return "border-l-4 border-orange-200";
  if (position >= 18) return "border-l-4 border-red-400";
  return "border-l-4 border-transparent";
}

export default async function TeamsPage() {
  const data = await getStandings();
  const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? [];

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
              name: "チーム",
              item: "https://premiernow.jp/teams",
            },
          ],
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-4">
          チーム一覧
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.season.startDate.slice(0, 4)}–{data.season.endDate.slice(2, 4)}
          </span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {table.map(({ position, team, points, won, draw, lost }) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div
                className={`bg-white border border-gray-200 rounded shadow-sm p-4 flex flex-col items-center gap-2 hover:border-pn-blue hover:shadow transition-all ${getZoneColor(position)}`}
              >
                <Image
                  src={team.crest}
                  alt={team.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <span className="text-xs font-medium text-center text-gray-900 leading-tight">
                  {team.shortName}
                </span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-gray-400">{position}位</span>
                  <span className="font-mono tabular-nums font-bold text-gray-900 text-sm">
                    {points}pt
                  </span>
                  <span className="text-xs text-gray-400 font-mono tabular-nums">
                    {won}勝{draw}分{lost}負
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 凡例 */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            UEFAチャンピオンズリーグ出場圏
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-400" />
            UEFAヨーロッパリーグ出場圏
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-200" />
            UEFAカンファレンスリーグ出場圏
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />
            降格圏
          </li>
        </ul>
      </div>
    </main>
  );
}
