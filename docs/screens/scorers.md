# 得点王ランキング

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | 得点王ランキング |
| URL | `/scorers` |
| `page.tsx` | `app/scorers/page.tsx` |
| 目的 | プレミアリーグの得点王・アシストランキングを一覧表示する |

ユーザーができること:
- 得点数順のランキングを確認
- 1〜3位の金・銀・銅バッジで上位者を視認
- 選手のイニシャルアバター・クラブエンブレムで視覚的に識別
- SP版では試合数・得点+A列を非表示にしてコンパクト表示

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `ScorersPage` | `app/scorers/page.tsx` | Server Component。データ取得・テーブルレイアウト |
| `ScorerRow` | `app/scorers/page.tsx`（内部） | テーブルの1行（選手1名分） |
| `Image`（Next.js） | 組み込み | クラブエンブレム表示 |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getScorers()` | `GET /competitions/PL/scorers` | 21600秒（6時間） | 得点王ランキング取得 |

---

## 4. APIレスポンス → 画面変数 対応表

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `scorers[]` | `data.scorers` | `Scorer[]` | テーブル全体 | API が返す順序（得点降順）をそのまま使用 |
| `scorer.player.id` | `scorer.player.id` | `number` | React key | — |
| `scorer.player.name` | `scorer.player.name` | `string` | 選手名 | イニシャルアバター生成にも使用 |
| `scorer.team.shortName` | `scorer.team.shortName` | `string` | クラブ名 | — |
| `scorer.team.crest` | `scorer.team.crest` | `string` | クラブエンブレム | — |
| `scorer.goals` | `scorer.goals` | `number` | 得点列 | **太字**で強調 |
| `scorer.assists` | `scorer.assists` | `number \| null` | アシスト（A）列 | null 時は「—」表示 |
| `scorer.playedMatches` | `scorer.playedMatches` | `number` | 試合数列（スマホ非表示） | — |
| — | `goalsPlusAssists` | `number` | 得点+A列（スマホ非表示） | `goals + (assists ?? 0)` で計算 |
| — | `rank` | `number` | 順位列（#） | `index + 1` で計算（0始まりindexに1加算） |
| `season.startDate` | `data.season.startDate` | `string` | ページタイトル横シーズン表記 | — |
| `season.endDate` | `data.season.endDate` | `string` | ページタイトル横シーズン表記 | — |

---

## 5. 状態管理

Server Component のため `useState` なし。

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 得点王ランキング 2025-26 | PremierInsight"` |
| `description` | `"プレミアリーグの得点王・アシストランキング。最新のゴール数をランキングで確認。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+得点王ランキング+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | `BreadcrumbList`（ホーム → 得点王ランキング） |

---

## 7. 既知の課題・TODO

- `scorer.penalties`（PK得点数）は型定義に存在するが現在の画面では表示していない
- 同得点の選手の順序はAPIレスポンス依存
