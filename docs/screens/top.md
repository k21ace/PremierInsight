# トップページ

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | トップページ |
| URL | `/` |
| `page.tsx` | `app/page.tsx` |
| 目的 | サイトのエントリーポイント。注目記事と最新試合結果を提示し、各ページへ誘導する |

ユーザーができること:
- ピックアップ記事（`featured: true`）を最大3件確認し、記事詳細へ遷移
- 直近3試合の結果（チーム名・スコア・日時）を確認
- 「すべての試合を見る →」から `/matches` へ遷移
- 注目カードで両チームの直近5試合フォーム・けが人・出場停止を確認（試合情報はAPIから自動取得）
- 注目カードのクイズリンクから `/quiz/[matchId]` へ遷移

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `Home`（page） | `app/page.tsx` | Server Component。データ取得・レイアウト制御 |
| `FeaturedMatchCard` | `components/FeaturedMatchCard.tsx` | 注目カード（フォーム比較・けが人・クイズリンク） |
| `FormBadges` | `components/ui/ResultBadge.tsx` | 直近5試合 W/D/L バッジ列 |
| `Link` | Next.js 組み込み | 記事カード・試合結果セクションのリンク |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getFeaturedArticles()` | ファイルシステム（`content/articles/*.mdx`） | — | `featured: true` の記事を最大3件取得 |
| `getMatches({ status: "FINISHED" })` | `GET /competitions/PL/matches?status=FINISHED` | 1800秒 | 終了済み試合一覧を取得し、最新3件・注目カードのフォームを表示 |
| `getUpcomingMatches(3)` | `GET /competitions/PL/matches?status=SCHEDULED\|TIMED` | 1800秒 | 直近3件の予定試合を取得 |
| `getFeaturedMatchDetail(homeTeamId, awayTeamId)` | `GET /competitions/PL/matches?status=SCHEDULED\|TIMED` + `GET /matches/{id}` | 1800秒 + 300秒 | 注目カードの試合詳細（utcDate・venue・チーム名）を自動取得。SCHEDULED/TIMED fetch は getUpcomingMatches と同一URLのためリクエストメモ化により重複なし |

注目カードの **けが人・出場停止情報・クイズスラッグ・プレビュー記事スラッグ・スコア予想のみ** `lib/match-preview-data.ts` の `FEATURED_MATCH_CONFIG` で静的管理（football-data.org 無料プランでは負傷者情報なし）。
utcDate・venue・homeTeam・awayTeam は API から自動取得するため、手動での入力ミスは発生しない。

### 注目カード更新手順（試合ごと）

次の試合に切り替える際は `lib/match-preview-data.ts` の `FEATURED_MATCH_CONFIG` のみを編集する。

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `homeTeamId` | ホームチームの football-data.org ID | `397` |
| `awayTeamId` | アウェイチームの football-data.org ID | `64` |
| `quizSlug` | `/articles/quiz/[slug]` に対応するクイズスラッグ | `"brighton-vs-liverpool"` |
| `previewArticleSlug` | `/articles/[slug]` に対応するプレビュー記事スラッグ | `"matchpreview-matchday31-brighton-liverpool"` |
| `homeInjuries` | ホームチームの負傷者・出場停止リスト | `[{ playerName, reason, status, returnDate }]` |
| `awayInjuries` | アウェイチームの負傷者・出場停止リスト | 同上 |
| `scorePrediction` | スコア予想（省略可） | `{ homeGoals, awayGoals, homeWinPct, drawPct, awayWinPct, comment }` |

クイズ問題数は `quizSlug` から `lib/quiz-data.ts` を参照して自動算出されるため、手動変更不要。

### 移籍チェックの仕組み

`InjuryInfo` の `playerId`（football-data.org の選手ID）を設定すると、ページ描画時に `GET /persons/{id}` で `currentTeam` を照合し、移籍済みの選手は注目カードから**自動除外**される。

- `playerId` 未設定の選手はチェックをスキップしてそのまま表示
- API エラー時はフェイルオープン（除外せず表示を維持）
- 移籍検知時はサーバーログに `console.warn` が出力される
- キャッシュは 24時間のため、移籍直後の反映は最大 24時間後

**選手IDの調べ方:** `https://www.football-data.org/v4/persons/{id}` で確認するか、試合詳細レスポンスの `goals[].scorer.id` などから取得する。

`Promise.all` で並列フェッチしている（ただし `getFeaturedArticles` はファイルシステム読み込みのため同期）。

---

## 4. APIレスポンス → 画面変数 対応表

### getMatches（試合結果セクション）

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `match.id` | `match.id` | `number` | React key | — |
| `match.utcDate` | `match.utcDate` | `string` | 試合日時列 | `convertToJSTShort()` でJST変換して表示 |
| `match.homeTeam.shortName` | `match.homeTeam.shortName` | `string` | ホームチーム名 | — |
| `match.awayTeam.shortName` | `match.awayTeam.shortName` | `string` | アウェイチーム名 | — |
| `match.score.fullTime.home` | `match.score.fullTime.home` | `number \| null` | スコア（左） | — |
| `match.score.fullTime.away` | `match.score.fullTime.away` | `number \| null` | スコア（右） | — |

### getFeaturedArticles（ピックアップ記事セクション）

| フロントマター項目 | 変数名（TypeScript） | 型 | 表示箇所 |
|-----------------|-------------------|-----|--------|
| `title` | `article.title` | `string` | 記事タイトル |
| `description` | `article.description` | `string` | 説明文 |
| `publishedAt` | `article.publishedAt` | `string` | 公開日 |
| `tags` | `article.tags` | `string[]` | タグ一覧 |
| — | `article.readingTime` | `string` | 読了時間（`reading-time` ライブラリで計算） |
| `slug`（ファイル名から） | `article.slug` | `string` | リンク先URL生成（`/articles/${slug}`） |

---

## 5. 状態管理

Server Component のため `useState` なし。インタラクティブな要素なし（ダークモードトグルは Header コンポーネント側で管理）。

---

## 5.5 ダークモード対応

| 項目 | 内容 |
|------|------|
| ライブラリ | `next-themes` |
| 切り替えUI | ヘッダー右上の Moon/Sun アイコンボタン（`components/ui/Header.tsx`） |
| クラス戦略 | `next-themes` が `<html class="dark">` を付与。Tailwind v4 で `@custom-variant dark (&:is(.dark *))` を設定済み |
| デフォルト | `system`（OS設定に追従） |
| 永続化 | `localStorage` に自動保存（`next-themes` 標準機能） |

`page.tsx` 内の全カード・テキスト・背景色に `dark:` クラスを付与済み。

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"PremierNow - プレミアリーグ データ分析"` |
| `description` | `"プレミアリーグの順位表・試合結果・得点王・データ分析を日本語で。毎節更新。"` |
| OGP画像 | `/api/og?title=PremierNow+...`（動的生成・1200×630） |
| Twitter Card | `summary_large_image` |
| JSON-LD | `WebSite` スキーマ（`name`, `url`, `description`, `inLanguage`） |
| sitemap.xml | `next-sitemap` でビルド後自動生成 |
| robots.txt | `next-sitemap` でビルド後自動生成（全クローラー許可） |

---

## 7. 既知の課題・TODO

- `getFeaturedArticles()` はビルド時のファイルシステム状態を参照するため、記事を追加してもISR再生成されるまで反映されない
- トップページの `revalidate = 1800`（30分）はgetMatchesに合わせた値。記事が更新された場合は手動再デプロイが必要
