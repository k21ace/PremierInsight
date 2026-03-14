# 試合結果・日程

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | 試合結果・日程 |
| URL | `/matches` または `/matches?matchday=<n>` |
| `page.tsx` | `app/matches/page.tsx` |
| 関連コンポーネント | `app/matches/MatchesView.tsx` |
| 目的 | 指定節（デフォルト: 現在節）の試合一覧を日付グルーピングで表示する |

ユーザーができること:
- 現在節の試合結果・日程を確認
- 「←」「→」ボタンで節を切り替えて過去/未来の試合を閲覧
- 各試合の得点者・分・得点種別（PK/OG）を確認
- 試合ステータス（終了/試合中/予定/延期）をバッジで確認

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `MatchesPage` | `app/matches/page.tsx` | Server Component。節番号の解決・データ取得 |
| `MatchesView` | `app/matches/MatchesView.tsx` | Client Component。節切り替えナビ・試合カード一覧 |
| `MatchCard` | `app/matches/MatchesView.tsx`（内部） | 1試合分のカード表示（スコア・得点者） |
| `StatusBadge` | `app/matches/MatchesView.tsx`（内部） | 試合ステータスバッジ |
| `Image`（Next.js） | 組み込み | エンブレム画像表示 |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getCurrentMatchday()` | `GET /competitions/PL/matches` | 1800秒 | `?matchday` 未指定時に現在節を取得 |
| `getMatches({ matchday: n })` | `GET /competitions/PL/matches?matchday=n` | 1800秒 | 指定節の試合一覧取得 |

`searchParams.matchday` が指定されている場合は `getCurrentMatchday()` を呼ばず1リクエストのみ。

---

## 4. APIレスポンス → 画面変数 対応表

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `matches[]` | `matches` | `Match[]` | 試合カード一覧 | — |
| `match.id` | `match.id` | `number` | React key | — |
| `match.utcDate` | `match.utcDate` | `string` | 試合時刻・日付グループキー | JST変換して表示 |
| `match.status` | `match.status` | `MatchStatus` | ステータスバッジ | FINISHED/IN_PLAY/SCHEDULED/POSTPONED など |
| `match.matchday` | `match.matchday` | `number` | 節切り替えナビ | `selectedMatchday` として管理 |
| `match.homeTeam.id` | `homeTeam.id` | `number` | 得点者の所属判定 | どちらチームの得点か判別に使用 |
| `match.homeTeam.shortName` | `homeTeam.shortName` | `string` | ホームチーム名 | — |
| `match.homeTeam.crest` | `homeTeam.crest` | `string` | ホームチームエンブレム | — |
| `match.awayTeam.id` | `awayTeam.id` | `number` | 得点者の所属判定 | — |
| `match.awayTeam.shortName` | `awayTeam.shortName` | `string` | アウェイチーム名 | — |
| `match.awayTeam.crest` | `awayTeam.crest` | `string` | アウェイチームエンブレム | — |
| `match.score.fullTime.home` | `score.fullTime.home` | `number \| null` | ホームスコア | null時は「—」表示 |
| `match.score.fullTime.away` | `score.fullTime.away` | `number \| null` | アウェイスコア | null時は「—」表示 |
| `match.goals[].scorer.name` | `g.scorer.name` | `string` | 得点者名 | — |
| `match.goals[].minute` | `g.minute` | `number \| null` | 得点分 | null時は非表示 |
| `match.goals[].type` | `g.type` | `"REGULAR" \| "OWN" \| "PENALTY"` | 得点種別 | OWN→`(OG)`, PENALTY→`(PK)` で表示 |
| `match.goals[].team.id` | `g.team.id` | `number` | 得点チーム判定 | OGの帰属チームを判別するため使用 |
| `resultSet.first` | `data.resultSet.first` | `string` | ページタイトル横シーズン表記 | — |
| `resultSet.last` | `data.resultSet.last` | `string` | ページタイトル横シーズン表記 | — |

---

## 5. 状態管理

| コンポーネント | state名 | 型 | 初期値 | 役割 |
|-------------|---------|-----|-------|------|
| `MatchesView` | — | — | — | state なし（節切り替えは `router.push` + searchParams で管理） |

節切り替えは `useRouter().push(`/matches?matchday=${n}`)` で URL を更新し、Server Component 側で再フェッチ。

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 試合結果・日程 2025-26 | PremierInsight"` |
| `description` | `"プレミアリーグの最新試合結果と今後の日程。得点者・スコアをリアルタイムで確認できます。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+試合結果・日程+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | `BreadcrumbList`（ホーム → 試合結果・日程） |

---

## 7. 既知の課題・TODO

- 節切り替えボタンを押すたびにページ全体がリロードされる（Server Component のISR再フェッチ）。ローディング表示は未実装
- `getCurrentMatchday()` は FINISHED 試合の最大節番号を返すため、シーズン開始直後（試合未消化時）は正しくない可能性がある
