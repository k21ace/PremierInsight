# 順位表

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | 順位表 |
| URL | `/standings` |
| `page.tsx` | `app/standings/page.tsx` |
| 目的 | プレミアリーグ全20チームの現在順位・成績・直近フォームを一覧表示する |

ユーザーができること:
- 順位・勝点・得失点・直近5試合のW/D/Lバッジを確認
- 順位帯（CL圏・EL圏・UECL圏・降格圏）を色分けボーダーで視認
- SP版ではカードリスト形式、PC版ではテーブル形式で表示

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `StandingsPage` | `app/standings/page.tsx` | Server Component。データ取得・PC/SP切り替えレイアウト |
| `StandingRow` | `app/standings/page.tsx`（内部） | PC版テーブル行 |
| `StandingCard` | `app/standings/page.tsx`（内部） | SP版カード |
| `FormBadge` | `app/standings/page.tsx`（内部） | W/D/L バッジ（緑/灰/赤） |
| `FormBadges` | `app/standings/page.tsx`（内部） | 直近5試合バッジ列 |
| `Image`（Next.js） | 組み込み | エンブレム画像表示 |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getStandingsWithForm()` | `GET /competitions/PL/standings` + `GET /competitions/PL/matches?status=FINISHED` | 3600秒 / 1800秒 | 順位表＋直近5試合フォームを取得（2リクエスト並列） |

`form` フィールドは無料プランではAPIから取得できないため、終了済み試合から自前計算している（`lib/football-api.ts` の `computeForm()`）。

---

## 4. APIレスポンス → 画面変数 対応表

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `standings[type=TOTAL].table` | `table` | `Standing[]` | テーブル全体 | TOTALのみ使用 |
| `standing.position` | `position` | `number` | 順位列（#） | 1〜20 |
| `standing.team.name` | `team.name` | `string` | クラブ名（PC版） | フルネーム |
| `standing.team.shortName` | `team.shortName` | `string` | クラブ名（SP版） | 略称 |
| `standing.team.crest` | `team.crest` | `string` | エンブレム画像 | URL形式 |
| `standing.playedGames` | `playedGames` | `number` | 試合数列（試） | — |
| `standing.won` | `won` | `number` | 勝利数列（勝） | — |
| `standing.draw` | `draw` | `number` | 引き分け数列（分） | — |
| `standing.lost` | `lost` | `number` | 敗北数列（負） | — |
| `standing.goalsFor` | `goalsFor` | `number` | 得点列（得） | — |
| `standing.goalsAgainst` | `goalsAgainst` | `number` | 失点列（失） | — |
| `standing.goalDifference` | `goalDifference` | `number` | 得失点差列（差） | `+n` 形式でフォーマット |
| `standing.points` | `points` | `number` | 勝点列 | **太字**で強調 |
| `standing.form`（自前計算） | `form` | `string[]` | 直近5試合バッジ列 | W/D/L の配列。APIはnullのため終了済み試合から計算 |
| `season.startDate` | `data.season.startDate` | `string` | ページタイトル横のシーズン表記 | `"2025-..."` の先頭4文字を使用 |
| `season.endDate` | `data.season.endDate` | `string` | ページタイトル横のシーズン表記 | `"20xx-..."` の2〜4文字を使用 |

---

## 5. 状態管理

Server Component のため `useState` なし。

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 順位表 2025-26 | PremierInsight"` |
| `description` | `"プレミアリーグの最新順位表。勝点・得失点差・直近5試合の結果をリアルタイムで確認できます。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+順位表+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | `BreadcrumbList`（ホーム → 順位表） |

---

## 7. 既知の課題・TODO

- 同点時の順位は得失点差・得点数などで決まるが、APIのpositionをそのまま使用しているため内部的な計算は行っていない
- 形式上 `form` は `string[]` だが、APIから返ってくる値は`null`のため `getStandingsWithForm()` で計算した値のみ有効
