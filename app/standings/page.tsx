import type { Metadata } from "next";
import Image from "next/image";
import { getStandingsWithForm } from "@/lib/football-api";
import type { Standing } from "@/types/football";
import { JsonLd } from "@/components/JsonLd";

const OG_TITLE = "プレミアリーグ 順位表 2025-26 最新 | PremierNow";
const OG_DESC =
  "プレミアリーグの最新順位表。勝点・得失点差・直近5試合の結果をリアルタイムで確認。";

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: "/standings",
    siteName: "PremierNow",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("プレミアリーグ 順位表 2025-26")}`,
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
      `/api/og?title=${encodeURIComponent("プレミアリーグ 順位表 2025-26")}`,
    ],
  },
};

// 順位帯ごとの左ボーダークラス
function getZoneBorder(position: number): string {
  if (position <= 4) return "border-l-4 border-blue-500";
  if (position === 5) return "border-l-4 border-orange-400";
  if (position === 6) return "border-l-4 border-orange-200";
  if (position >= 18) return "border-l-4 border-red-500";
  return "border-l-4 border-transparent";
}

// 得失点差を +n 形式で表示
function formatGD(gd: number): string {
  return gd > 0 ? `+${gd}` : String(gd);
}

// W/D/L バッジ
function FormBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    W: "bg-green-600 text-white",
    D: "bg-gray-400 text-white",
    L: "bg-red-500 text-white",
  };
  const style = styles[result] ?? "bg-gray-200 text-gray-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-sm ${style}`}
    >
      {result}
    </span>
  );
}

// 直近5試合バッジ列
function FormBadges({ form }: { form: string[] }) {
  if (form.length === 0) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="flex gap-0.5">
      {form.map((r, i) => (
        <FormBadge key={i} result={r} />
      ))}
    </span>
  );
}

// ── PC: テーブル行 ─────────────────────────────────────────

function StandingRow({ standing }: { standing: Standing }) {
  const { position, team, playedGames, won, draw, lost, goalsFor, goalsAgainst, goalDifference, points, form } = standing;

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getZoneBorder(position)}`}>
      {/* 順位 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-gray-500 w-8 text-center">
        {position}
      </td>
      {/* クラブ */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Image
            src={team.crest}
            alt={team.name}
            width={20}
            height={20}
            className="object-contain shrink-0"
          />
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {team.name}
          </span>
        </div>
      </td>
      {/* 試合数 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {playedGames}
      </td>
      {/* 勝 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {won}
      </td>
      {/* 分 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {draw}
      </td>
      {/* 負 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {lost}
      </td>
      {/* 得 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {goalsFor}
      </td>
      {/* 失 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {goalsAgainst}
      </td>
      {/* 差 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center text-gray-700">
        {formatGD(goalDifference)}
      </td>
      {/* 勝点 */}
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-center font-semibold text-gray-900">
        {points}
      </td>
      {/* 直近5試合 */}
      <td className="px-3 py-2.5">
        <FormBadges form={form} />
      </td>
    </tr>
  );
}

// ── スマホ: カード ─────────────────────────────────────────

function StandingCard({ standing }: { standing: Standing }) {
  const { position, team, playedGames, won, draw, lost, goalsFor, goalsAgainst, goalDifference, points, form } = standing;

  return (
    <div className={`bg-white border-b border-gray-200 py-3 px-4 ${getZoneBorder(position)}`}>
      {/* 1行目: 順位 + エンブレム + チーム名 ／ 勝点 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 text-center text-sm font-mono tabular-nums text-gray-500">
            {position}
          </span>
          <Image
            src={team.crest}
            alt={team.name}
            width={24}
            height={24}
            className="object-contain shrink-0"
          />
          <span className="text-sm font-medium text-gray-900">
            {team.shortName}
          </span>
        </div>
        <span className="text-lg font-bold font-mono tabular-nums text-gray-900">
          {points}
        </span>
      </div>

      {/* 2行目: 成績数字 */}
      <div className="flex gap-3 text-xs text-gray-500 mt-1 ml-12 font-mono tabular-nums">
        <span>{playedGames}試</span>
        <span>{won}勝</span>
        <span>{draw}分</span>
        <span>{lost}負</span>
        <span>得{goalsFor}</span>
        <span>失{goalsAgainst}</span>
        <span>差{formatGD(goalDifference)}</span>
      </div>

      {/* 3行目: 直近5試合 */}
      <div className="flex gap-1 mt-1 ml-12">
        <FormBadges form={form} />
      </div>
    </div>
  );
}

// ── ページ ────────────────────────────────────────────────

export default async function StandingsPage() {
  const data = await getStandingsWithForm();
  // TOTAL テーブルのみ使用
  const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? [];

  return (
    <main className="min-h-screen bg-pn-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: "https://premiernow.jp" },
            { "@type": "ListItem", position: 2, name: "順位表", item: "https://premiernow.jp/standings" },
          ],
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ページ見出し */}
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-4">
          プレミアリーグ 順位表
          <span className="ml-2 text-sm font-normal text-gray-500">
            {data.season.startDate.slice(0, 4)}–{data.season.endDate.slice(2, 4)}
          </span>
        </h1>

        {/* スマホ: カードリスト（md未満） */}
        <div className="md:hidden bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {table.map((standing) => (
            <StandingCard key={standing.team.id} standing={standing} />
          ))}
        </div>

        {/* PC: テーブル（md以上） */}
        <div className="hidden md:block bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-3 py-2 text-center w-8">#</th>
                <th className="px-3 py-2 text-left">クラブ</th>
                <th className="px-3 py-2 text-center">試</th>
                <th className="px-3 py-2 text-center">勝</th>
                <th className="px-3 py-2 text-center">分</th>
                <th className="px-3 py-2 text-center">負</th>
                <th className="px-3 py-2 text-center">得</th>
                <th className="px-3 py-2 text-center">失</th>
                <th className="px-3 py-2 text-center">差</th>
                <th className="px-3 py-2 text-center">勝点</th>
                <th className="px-3 py-2 text-left">直近5試合</th>
              </tr>
            </thead>
            <tbody>
              {table.map((standing) => (
                <StandingRow key={standing.team.id} standing={standing} />
              ))}
            </tbody>
          </table>
        </div>

        {/* 凡例 */}
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
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
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
            降格圏
          </li>
        </ul>
      </div>
    </main>
  );
}
