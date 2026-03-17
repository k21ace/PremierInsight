"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Scorer } from "@/types/football";
import type { PersonResponse } from "@/types/football";
import type { PlayerSNS } from "@/lib/mock/player-sns";
import type { PlayerDetailStats } from "@/lib/mock/player-stats";
import type { PlayerCareer } from "@/lib/mock/player-career";
import { SEASONS, DEFAULT_SEASON } from "@/lib/seasons";
import { getFlagEmoji } from "@/lib/nationality-flag";
import { getInitials } from "@/lib/formatting";
import { SNSIcon } from "@/components/ui/SNSIcon";

// ─── ユーティリティ ──────────────────────────────────────

function calcAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// ─── 小コンポーネント ─────────────────────────────────────

const PLATFORM_LABEL: Record<PlayerSNS["sns"][number]["platform"], string> = {
  instagram: "Instagram",
  x: "X (Twitter)",
  youtube: "YouTube",
  tiktok: "TikTok",
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-mono tabular-nums font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-gray-900 mb-4">{children}</h2>
  );
}

// ─── Props ────────────────────────────────────────────────

interface Props {
  player: PersonResponse;
  playerId: number;
  /** シーズン年 → 該当選手の Scorer エントリ（なければ null） */
  seasonData: Record<number, Scorer | null>;
  snsData: PlayerSNS | null;
  /** 全シーズンの詳細スタッツ */
  detailStatsAll: PlayerDetailStats[];
  career: PlayerCareer | null;
}

// ─── メインコンポーネント ──────────────────────────────────

export default function PlayerDetailClient({
  player,
  playerId,
  seasonData,
  snsData,
  detailStatsAll,
  career,
}: Props) {
  const [selectedSeason, setSelectedSeason] = useState<number>(DEFAULT_SEASON);

  const scorerEntry = seasonData[selectedSeason] ?? null;
  const detailStats =
    detailStatsAll.find((s) => s.season === selectedSeason) ?? null;

  const birthDate = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const age = player.dateOfBirth ? calcAge(player.dateOfBirth) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* パンくず */}
      <nav className="text-sm text-gray-500">
        <Link href="/players" className="hover:text-pn-blue transition-colors">
          Player
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-gray-900">{player.name}</span>
      </nav>

      {/* ─── セクション1: ヘッダー ─────────────────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm px-5 py-6">
        <div className="flex items-start gap-5">
          {/* イニシャルアバター */}
          <div className="w-20 h-20 rounded-full bg-pn-blue-light text-pn-navy flex items-center justify-center text-2xl font-bold shrink-0 select-none">
            {getInitials(player.name)}
          </div>

          {/* 選手情報 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {player.name}
            </h1>

            {/* 国籍 */}
            {player.nationality && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="mr-1.5">{getFlagEmoji(player.nationality)}</span>
                {player.nationality}
              </p>
            )}

            {/* 所属チーム */}
            {player.currentTeam ? (
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src={player.currentTeam.crest}
                  alt={player.currentTeam.name}
                  width={22}
                  height={22}
                  className="object-contain shrink-0"
                />
                <span className="text-sm font-medium text-gray-800">
                  {player.currentTeam.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">所属チーム不明</p>
            )}

            {/* ポジション・生年月日・年齢 */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              {player.position && (
                <span className="text-sm text-gray-500">
                  <span className="text-gray-400 text-xs mr-1">POS</span>
                  {player.position}
                </span>
              )}
              {birthDate && (
                <span className="text-sm text-gray-500">
                  <span className="text-gray-400 text-xs mr-1">生年月日</span>
                  {birthDate}
                  {age !== null && (
                    <span className="ml-1 text-gray-400">（{age}歳）</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── セクション2: 今シーズンスタッツ ────────────── */}
      <section className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">スタッツ</h2>
          {/* シーズン選択 */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-pn-blue"
          >
            {SEASONS.map((s) => (
              <option key={s.year} value={s.year}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* APIスタッツ（metric card） */}
        {scorerEntry ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricCard label="得点" value={scorerEntry.goals} />
            <MetricCard label="アシスト" value={scorerEntry.assists ?? "—"} />
            <MetricCard label="出場試合" value={scorerEntry.playedMatches} />
            <MetricCard
              label="得点+A"
              value={scorerEntry.goals + (scorerEntry.assists ?? 0)}
            />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded shadow-sm px-5 py-4 text-sm text-gray-500 mb-4">
            このシーズンの得点スタッツデータはありません。
          </div>
        )}

        {/* 詳細スタッツ（モック） */}
        {detailStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* シュート */}
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                シュート
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-gray-900">
                    {detailStats.shots}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">シュート</p>
                </div>
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-gray-900">
                    {detailStats.shotsOnTarget}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">枠内</p>
                </div>
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-pn-blue">
                    {detailStats.shotAccuracy}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">精度</p>
                </div>
              </div>
            </div>

            {/* パス */}
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                パス
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-pn-blue">
                    {detailStats.passAccuracy}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">パス精度</p>
                </div>
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-gray-900">
                    {detailStats.keyPasses}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">キーパス</p>
                </div>
              </div>
            </div>

            {/* ドリブル・守備 */}
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                ドリブル・守備
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-gray-900">
                    {detailStats.dribbles}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">ドリブル</p>
                </div>
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-gray-900">
                    {detailStats.tackles}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">タックル</p>
                </div>
              </div>
            </div>

            {/* カード */}
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                カード
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-amber-500">
                    {detailStats.yellowCards}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">イエロー</p>
                </div>
                <div>
                  <p className="text-lg font-mono tabular-nums font-semibold text-red-500">
                    {detailStats.redCards}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">レッド</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded shadow-sm px-5 py-4 text-sm text-gray-500">
            このシーズンの詳細スタッツは準備中です。
          </div>
        )}
      </section>

      {/* ─── セクション3: 過去シーズン成績 ──────────────── */}
      <section className="border-t border-gray-100 pt-6">
        <SectionTitle>シーズン成績</SectionTitle>
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-2 text-left">シーズン</th>
                <th className="px-4 py-2 text-left">クラブ</th>
                <th className="px-4 py-2 text-center">得点</th>
                <th className="px-4 py-2 text-center">A</th>
                <th className="px-4 py-2 text-center">出場</th>
              </tr>
            </thead>
            <tbody>
              {SEASONS.map((s) => {
                const entry = seasonData[s.year];
                return (
                  <tr
                    key={s.year}
                    className={`border-b border-gray-100 ${
                      s.year === selectedSeason ? "bg-pn-blue-light" : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.label}
                      {s.year === selectedSeason && (
                        <span className="ml-2 text-xs text-pn-blue font-normal">
                          選択中
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={entry.team.crest}
                            alt={entry.team.name}
                            width={18}
                            height={18}
                            className="object-contain shrink-0"
                          />
                          <span className="text-gray-700">{entry.team.shortName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums font-semibold text-gray-900">
                      {entry?.goals ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums text-gray-700">
                      {entry?.assists ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums text-gray-600">
                      {entry?.playedMatches ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── セクション4: SNSリンク ───────────────────────── */}
      <section className="border-t border-gray-100 pt-6">
        <SectionTitle>SNS</SectionTitle>
        {snsData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {snsData.sns.map((s) => (
              <div
                key={s.platform}
                className="bg-white border border-gray-200 rounded shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    <SNSIcon platform={s.platform} />
                  </span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {PLATFORM_LABEL[s.platform]}
                    </p>
                    <p className="text-sm font-medium text-gray-900">{s.handle}</p>
                  </div>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-pn-blue hover:text-pn-navy font-medium transition-colors whitespace-nowrap"
                >
                  プロフィールを見る
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded shadow-sm px-5 py-4 text-sm text-gray-500">
            SNS情報は準備中です。
          </div>
        )}
      </section>

      {/* ─── セクション5: キャリア履歴 ───────────────────── */}
      <section className="border-t border-gray-100 pt-6 pb-2">
        <SectionTitle>クラブキャリア</SectionTitle>
        {career ? (
          <div className="space-y-0">
            {career.career.map((entry, i) => (
              <div
                key={`${entry.season}-${entry.club}`}
                className="flex gap-4 relative"
              >
                {/* タイムライン線 */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-pn-blue mt-5 shrink-0 z-10" />
                  {i < career.career.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>

                {/* カード */}
                <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm px-4 py-3 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {entry.crestUrl && (
                        <Image
                          src={entry.crestUrl}
                          alt={entry.club}
                          width={22}
                          height={22}
                          className="object-contain shrink-0"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {entry.club}
                          {entry.note && (
                            <span className="ml-2 text-xs text-gray-400 font-normal">
                              {entry.note}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{entry.season}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono tabular-nums">
                      <span className="text-gray-500">
                        <span className="text-gray-400 text-xs mr-0.5">G</span>
                        <span className="font-semibold text-gray-900">{entry.goals}</span>
                      </span>
                      <span className="text-gray-500">
                        <span className="text-gray-400 text-xs mr-0.5">A</span>
                        <span className="font-semibold text-gray-900">{entry.assists}</span>
                      </span>
                      <span className="text-gray-500">
                        <span className="text-gray-400 text-xs mr-0.5">出</span>
                        <span className="font-semibold text-gray-900">{entry.appearances}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded shadow-sm px-5 py-4 text-sm text-gray-500">
            キャリアデータは準備中です。
          </div>
        )}
      </section>
    </div>
  );
}
