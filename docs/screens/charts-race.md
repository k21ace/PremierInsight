# レースチャート

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | レースチャート |
| URL | `/charts/race` |
| `page.tsx` | `app/charts/race/page.tsx` |
| 関連コンポーネント | `app/charts/race/RaceChart.tsx`、`components/charts/RaceChartPC.tsx`、`components/charts/RaceChartSP.tsx` |
| 目的 | 節ごとの勝点推移を折れ線グラフで可視化し、優勝争い・CL圏争い・残留争いの3グループで分析する |

ユーザーができること:
- 3タブ（優勝争い上位3チーム / CL圏争い3〜7位 / 残留争い16〜20位）を切り替えて各グループを確認
- 各チームの節ごと累計勝点推移をエンブレムDotで視認（PC版）
- 予測勝点（直近5節avgPPGから38節まで外挿）を点線で確認（PC版）
- キーモーメント（首位交代・直接対決・ゾーン変化）をReferenceLine縦線で確認（PC版）
- チームエンブレムにホバーしてTooltipで詳細を確認（PC版）
- SP版では主要な実績ラインのみシンプルに表示

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `RacePage` | `app/charts/race/page.tsx` | Server Component。データ取得・グループ定義 |
| `RaceChart` | `app/charts/race/RaceChart.tsx` | Client Component。タブ切り替え・データ絞り込み |
| `RaceChartPC` | `components/charts/RaceChartPC.tsx` | Recharts グラフ PC版（500px・全機能） |
| `RaceChartSP` | `components/charts/RaceChartSP.tsx` | Recharts グラフ SP版（360px・簡略） |
| `ChartsLayout` | `app/charts/layout.tsx` | チャートサブナビ（レースチャート/スタイル分析） |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getMatches({ status: "FINISHED" })` | `GET /competitions/PL/matches?status=FINISHED` | 3600秒 | 終了済み試合から勝点推移を計算 |
| `getStandings()` | `GET /competitions/PL/standings` | 3600秒 | 公式順位表からグループ（タブ）のチームIDを決定 |

`Promise.all` で並列フェッチ。

---

## 4. APIレスポンス → 画面変数 対応表

### calcPointsTimeline（勝点推移計算）

`finishedData.matches` → `calcPointsTimeline()` → `timelines: TeamTimeline[]`

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `match.homeTeam.id` / `match.awayTeam.id` | `teamId` | `number` | チーム識別 | 全チームを自動収集 |
| `match.homeTeam.tla` / `match.awayTeam.tla` | `teamShortName` | `string` | グラフの折れ線ラベル・Tooltip | 3文字略称（例: ARS） |
| `match.homeTeam.crest` / `match.awayTeam.crest` | `crestUrl` | `string` | 終端エンブレムDot | — |
| `match.score.fullTime.home/away` | `points[]` | `number[]` | 節ごと累計勝点（Y軸） | 各節のデルタ（0/1/3）を累積 |
| — | `avgPPG` | `number` | 予測計算に使用 | 直近5節平均勝点/節 |
| — | `predictedPoints[]` | `number[]` | 予測点線（PC版のみ） | avgPPGで38節まで外挿 |
| — | `color` | `string` | 折れ線の色 | `lib/team-colors.ts` のマッピングを使用 |

### getStandings（グループ定義）

| API項目名（英語） | 変数名（TypeScript） | 型 | 用途 |
|-----------------|-------------------|-----|------|
| `standings[TOTAL].table[0-2].team.id` | `groupTeamIds.title` | `number[]` | 優勝争いタブのチームID |
| `standings[TOTAL].table[2-6].team.id` | `groupTeamIds.cl` | `number[]` | CL圏争いタブのチームID |
| `standings[TOTAL].table[15-19].team.id` | `groupTeamIds.relegation` | `number[]` | 残留争いタブのチームID |
| `standings[TOTAL].table[16].team.id` | `safeZoneTeamId` | `number \| null` | 降格圏境界チームID（アノテーション用） |

---

## 5. 状態管理

| コンポーネント | state名 | 型 | 初期値 | 役割 |
|-------------|---------|-----|-------|------|
| `RaceChart` | `group` | `"title" \| "cl" \| "relegation"` | `"title"` | 現在選択中のタブグループ |

`group` が変わると `activeTeamIds`・`activeTimelines`・`chartData`・`dramaticMoments` が `useMemo` で再計算される。

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 優勝争い・降格争いチャート 2025-26 | PremierInsight"` |
| `description` | `"節ごとの勝点推移を可視化。優勝争いと降格争いをリアルタイムで追えます。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+優勝争い・降格争いチャート+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | なし |

---

## 7. 既知の課題・TODO

- ブランクGW（チームによって試合数が異なる節）では前節の勝点を引き継ぐ処理を行っているが、複数節にまたがる試合未消化は考慮できていない
- SP版は予測・ハイライト・アノテーションを非表示にしているため情報量が少ない
- `calcDramaticEvents` の zone_change 検出は全試合データを毎回走査するため、試合数が多いとやや重い
