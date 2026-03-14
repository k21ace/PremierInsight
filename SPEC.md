# PremierInsight 仕様書

> 最終更新: 2026-03-14 — /standings・/matches 実装・Header 追加

## 目次

1. [サイト概要](#1-サイト概要)
2. [技術スタック](#2-技術スタック)
3. [環境変数一覧](#3-環境変数一覧)
4. [ディレクトリ構成](#4-ディレクトリ構成)
5. [データソース仕様](#5-データソース仕様)
6. [実装済み機能](#6-実装済み機能)
7. [今後実装予定の機能](#7-今後実装予定の機能未実装)
8. [運用ルール](#8-運用ルール)
9. [デザインガイドライン](#9-デザインガイドライン)

---

## 1. サイト概要

| 項目 | 内容 |
|------|------|
| サイト名 | PremierInsight |
| コンセプト | プレミアリーグのデータを日本語で分析・可視化するサイト |
| ターゲット | プレミアリーグを深く楽しみたい日本人 |
| 本番URL | https://premier-insight.vercel.app/ |
| 対象リーグ | イングランド プレミアリーグ（PL） |

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.1.6 |
| 言語 | TypeScript | ^5 |
| UI ライブラリ | React | 19.2.3 |
| スタイリング | Tailwind CSS | ^4 |
| アナリティクス | @next/third-parties（Google Analytics 4） | ^16.1.6 |
| パッケージマネージャー | npm | — |
| ホスティング | Vercel | — |
| データソース | football-data.org API v4 | — |

### レンダリング戦略

- **Server Components** + **ISR（Incremental Static Regeneration）** を基本とする
- API レスポンスは `fetch` の `next.revalidate` でキャッシュし、リクエスト数を節約する

---

## 3. 環境変数一覧

| 変数名 | 用途 | 設定場所 |
|--------|------|---------|
| `FOOTBALL_DATA_API_KEY` | football-data.org API 認証キー（サーバーサイドのみ） | `.env.local` / Vercel 環境変数 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 測定ID | `.env.local` / Vercel 環境変数 |
| `NEXT_PUBLIC_SITE_URL` | サイトのベースURL（OGPなどで使用） | `.env.local` / Vercel 環境変数 |

> **注意**: `.env.local` は `.gitignore` の `.env*` ルールにより Git 管理対象外。本番環境の値は Vercel ダッシュボードで設定すること。

---

## 4. ディレクトリ構成

```
c:/ws/PremierInsight/
│
├── app/                        # Next.js App Router のルートディレクトリ
│   ├── layout.tsx              # ルートレイアウト（GA4 組み込み・メタデータ設定）
│   ├── page.tsx                # トップページ（ナビゲーション）
│   ├── globals.css             # グローバルスタイル（Tailwind ベース）
│   ├── favicon.ico             # ファビコン
│   ├── standings/
│   │   └── page.tsx            # 順位表ページ（実装済み）
│   ├── matches/
│   │   ├── page.tsx            # 試合結果・スケジュールページ（実装済み・Server Component）
│   │   └── MatchesView.tsx     # 節切り替え・試合カード表示（Client Component）
│   ├── scorers/
│   │   └── page.tsx            # 得点王ランキングページ（未実装）
│   └── articles/
│       └── page.tsx            # 分析記事一覧ページ（未実装）
│
├── components/
│   └── ui/
│       └── Header.tsx          # 共通ヘッダーナビゲーション（usePathname でアクティブ表示）
│
├── lib/
│   ├── football-api.ts         # football-data.org API ラッパー関数群
│   └── utils.ts                # 汎用ユーティリティ（UTC→JST変換など）
│
├── types/
│   └── football.ts             # football-data.org API レスポンス型定義
│
├── public/                     # 静的ファイル
│
├── .env.local                  # 環境変数（Git 管理外）
├── .gitignore
├── eslint.config.mjs           # ESLint 設定
├── next.config.ts              # Next.js 設定
├── package.json
├── postcss.config.mjs          # PostCSS 設定（Tailwind v4 用）
├── SPEC.md                     # 本仕様書
└── tsconfig.json               # TypeScript 設定
```

---

## 5. データソース仕様

### football-data.org API v4

| 項目 | 内容 |
|------|------|
| ベースURL | `https://api.football-data.org/v4` |
| 認証方式 | リクエストヘッダー `X-Auth-Token: {APIキー}` |
| 無料プラン 月間制限 | 無制限（ただし同時アクセス制限あり） |
| 無料プラン 分間制限 | **10リクエスト / 分** |

### 使用エンドポイント一覧

| エンドポイント | 用途 | revalidate |
|---------------|------|-----------|
| `GET /competitions/PL/standings` | 順位表取得 | 3600秒（1時間） |
| `GET /competitions/PL/matches` | 試合一覧取得（節・ステータスで絞り込み可） | 1800秒（30分） |
| `GET /competitions/PL/scorers` | 得点王ランキング取得 | 21600秒（6時間） |

---

## 6. 実装済み機能

### 6-1. APIラッパー（`/lib/football-api.ts`）

| 関数名 | 処理内容 | 返り値の型 | revalidate |
|--------|---------|-----------|-----------|
| `getStandings()` | プレミアリーグの順位表を取得 | `StandingsResponse` | 3600秒 |
| `getStandingsWithForm()` | 順位表取得＋終了済み試合から直近5試合を自前計算して付与（無料プランはAPIのformがnullのため） | `StandingsResponse` | 3600秒 |
| `getMatches(options?)` | 試合一覧を取得。`matchday`・`status` でフィルタ可 | `MatchesResponse` | 1800秒 |
| `getCurrentMatchday()` | `getMatches()` 経由で現在の節番号を取得 | `number` | 1800秒 |
| `getScorers()` | 得点王ランキングを取得 | `ScorersResponse` | 21600秒 |

**共通仕様**:
- `FOOTBALL_DATA_API_KEY` 未設定時は `Error` を throw
- HTTPステータスが `ok` でない場合は `Error` を throw
- `fetch` の `next.revalidate` で ISR キャッシュを設定

### 6-2. ユーティリティ（`/lib/utils.ts`）

| 関数名 | 処理内容 | 返り値の例 |
|--------|---------|----------|
| `convertToJST(utcDate)` | UTC日時文字列を JST の長い形式に変換 | `"2025年8月16日(土) 23:00"` |
| `convertToJSTShort(utcDate)` | UTC日時文字列を JST の短い形式に変換 | `"8/16 23:00"` |

### 6-3. 型定義（`/types/football.ts`）

| 型名 | 概要 |
|------|------|
| `Competition` | リーグ（コンペティション）情報 |
| `Season` | シーズン情報（現在の節番号・優勝チームを含む） |
| `Team` | チーム情報（名前・略称・エンブレムURLなど） |
| `Standing` | 順位表の1行分（勝点・得失点差・直近成績など） |
| `StandingsTable` | 順位表グループ（TOTAL / HOME / AWAY） |
| `StandingsResponse` | `GET /standings` のレスポンス全体 |
| `MatchStatus` | 試合ステータスのユニオン型（8種類） |
| `HalfScore` | ハーフタイム・フルタイムスコア |
| `Score` | スコア情報（勝者・前後半スコア） |
| `Goal` | 試合内の得点者情報（分・得点者・得点種別） |
| `Match` | 試合情報（日時・ステータス・スコア・得点者リストを含む） |
| `MatchesResponse` | `GET /matches` のレスポンス全体 |
| `Scorer` | 得点王ランキングの1エントリー（得点・アシスト・出場試合数） |
| `ScorersResponse` | `GET /scorers` のレスポンス全体 |

### 6-4. ページ

| ページ | パス | 実装内容 |
|--------|------|---------|
| トップページ | `/` | 各ページへのナビゲーションカード |
| 順位表 | `/standings` | TOTAL順位表テーブル・順位帯色分け・W/D/Lバッジ・凡例・レスポンシブ対応（スマホ=カードリスト/PC=テーブル）・直近5試合を終了済み試合から自前計算で表示 |
| 試合結果・日程 | `/matches` | 節切り替えナビ（searchParams）・日付グルーピング・得点者表示・ステータスバッジ |
| 得点王ランキング | `/scorers` | ランキングテーブル・1〜3位CSSバッジ（金/銀/銅）・イニシャルアバター・クラブエンブレム・レスポンシブ対応（試合/得点+A列をスマホ非表示） |

### 6-5. その他

| 機能 | 実装箇所 | 内容 |
|------|---------|------|
| Google Analytics 4 | `app/layout.tsx` | `@next/third-parties` を使用。本番環境（`NODE_ENV === "production"`）のみ計測 |
| 共通ヘッダー | `components/ui/Header.tsx` | サイト名・ナビリンク・アクティブ表示（`usePathname`） |

---

## 7. 今後実装予定の機能（未実装）

| ページ | パス | 内容 | フェーズ |
|--------|------|------|---------|
| ~~順位表~~ | ~~`/standings`~~ | ~~リーグ順位表（勝点・得失点・直近5試合成績）~~ | ✅ 実装済み |
| ~~試合結果・スケジュール~~ | ~~`/matches`~~ | ~~節ごとのスコア・スケジュール一覧~~ | ✅ 実装済み |
| ~~得点王ランキング~~ | ~~`/scorers`~~ | ~~得点・アシスト・出場試合数のランキング~~ | ✅ 実装済み |
| 分析記事一覧 | `/articles` | 戦術・データ分析コンテンツ | フェーズ4 |
| 選手スタッツ | `/players` | 個人成績の詳細表示 | フェーズ5 |

---

## 8. 運用ルール

1. **SPEC.md の更新を必ず行う**
   機能を追加・変更した場合は、必ず本ファイルの該当セクションを更新すること。

2. **ステータス管理**
   「未実装」→「実装済み」に変わった機能は、セクション 6（実装済み機能）に移動し、実装内容・返り値・キャッシュ設定などを記載すること。

3. **git commit 前の確認**
   コミット前に `SPEC.md` の更新が漏れていないか確認すること。

4. **APIリクエスト数の管理**
   football-data.org 無料プランは **10リクエスト / 分** の制限がある。開発中は不必要なリクエストを避け、ISRキャッシュを活用すること。

5. **シークレット管理**
   APIキー・測定IDなどの秘匿情報は `.env.local` に記載し、絶対にコミットしないこと。本番環境の値は Vercel ダッシュボードで管理すること。

---

## 9. デザインガイドライン

### コンセプト

**「データが主役・余白が語る」**

白ベース・クリーンで FBref / Sofacsore に近いデザイン。
AI生成デフォルトの過度な角丸・グラデーション・カラフル配色は使わない。

---

### カラーパレット

| 用途 | Tailwindクラス | カラーコード |
|------|---------------|-------------|
| ページ背景 | `bg-gray-50` | `#f9fafb` |
| カード背景 | `bg-white` | `#ffffff` |
| ホバー | `bg-gray-50` | `#f9fafb` |
| ボーダー | `border-gray-200` | `#e5e7eb` |
| テキスト主 | `text-gray-900` | `#111827` |
| テキスト補助 | `text-gray-500` | `#6b7280` |
| アクセント | `text-violet-600` | `#7c3aed` |
| 勝利バッジ | `bg-green-600` | `#16a34a` |
| 引き分けバッジ | `bg-gray-400` | `#9ca3af` |
| 敗北バッジ | `bg-red-500` | `#ef4444` |
| CL圏左ボーダー | `border-blue-500` | `#3b82f6` |
| EL圏左ボーダー | `border-orange-400` | `#fb923c` |
| 降格圏左ボーダー | `border-red-500` | `#ef4444` |

---

### タイポグラフィ

| 用途 | クラス・フォント |
|------|----------------|
| 見出し | `font-semibold tracking-tight text-gray-900` |
| 数字 | `font-mono tabular-nums`（**必須**） |
| 日本語本文 | Noto Sans JP |
| 英数字 | Inter |

---

### コンポーネント原則

| ルール | 内容 |
|--------|------|
| 角丸 | `rounded` まで（`rounded-lg` 以上禁止） |
| シャドウ | `shadow-sm` のみ（`shadow-md` 以上禁止） |
| 区切り | ボーダーで区切る（シャドウで浮かせない） |
| テーブルヘッダー | `bg-gray-50 text-gray-500 text-xs uppercase tracking-wider` |
| W/D/L バッジ | `w-6 h-6 text-xs font-bold rounded-sm` 正方形 |

---

### やってはいけないこと

- `rounded-xl` 以上の角丸
- `shadow-md` 以上のシャドウ
- グラデーション背景（`bg-gradient-*`）
- カラフルすぎる配色（アクセントは `violet-600` に統一）
- Hero画像
- 過度なアニメーション
