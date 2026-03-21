# アーキテクチャ

## システム構成図

```
ブラウザ
  │
  ▼
Vercel（ホスティング）
  │  Next.js 15 App Router
  │  ISR（Incremental Static Regeneration）
  │
  ▼
football-data.org API v4
  └─ GET /competitions/PL/standings
  └─ GET /competitions/PL/matches
  └─ GET /competitions/PL/scorers
```

- **Server Components** でAPIフェッチ → `next.revalidate` でISRキャッシュ
- **Client Components** は状態管理（タブ切り替え・フィルター）のみに限定
- **Recharts** でインタラクティブなグラフを描画（Client Component）
- **next-mdx-remote** でMDXファイルをサーバーサイドレンダリング

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| フレームワーク | Next.js（App Router） | 15.x |
| 言語 | TypeScript | ^5 |
| UI | React | 19.x |
| スタイリング | Tailwind CSS | ^4 |
| グラフ | Recharts | — |
| MDX | next-mdx-remote | — |
| MDXパーサー | gray-matter | — |
| 読了時間計算 | reading-time | — |
| OGP画像生成 | next/og（ImageResponse） | — |
| サイトマップ | next-sitemap | — |
| アナリティクス | @next/third-parties（GA4） | — |
| ホスティング | Vercel | — |
| データソース | football-data.org API v4 | — |

---

## ディレクトリ構成

```
c:/ws/PremierNow/
│
├── app/                        # Next.js App Router ルートディレクトリ
│   ├── layout.tsx              # ルートレイアウト（フォント・GA4・Headerを配置）
│   ├── page.tsx                # トップページ（ピックアップ記事・最新試合結果）
│   ├── globals.css             # グローバルスタイル（Tailwind ベース）
│   ├── favicon.ico
│   │
│   ├── api/
│   │   └── og/
│   │       └── route.tsx       # 動的OGP画像生成（Edge Runtime・1200×630）
│   │
│   ├── standings/
│   │   └── page.tsx            # 順位表（Server Component・ISR 3600秒）
│   │
│   ├── matches/
│   │   ├── page.tsx            # 試合結果・日程（Server Component・searchParams対応）
│   │   └── MatchesView.tsx     # 節切り替え・試合カード（Client Component）
│   │
│   ├── scorers/
│   │   └── page.tsx            # 得点王ランキング（Server Component・ISR 21600秒）
│   │
│   ├── players/
│   │   ├── page.tsx            # 選手スタッツ一覧（Server Component・ISR 21600秒）
│   │   ├── PlayersView.tsx     # シーズン切り替え・チームフィルター・ソート・テーブル（Client Component）
│   │   └── [id]/
│   │       ├── page.tsx             # 選手詳細（Server Component・3シーズン並列取得）
│   │       └── PlayerDetailClient.tsx # Fotmob風詳細UI・シーズン切り替え（Client Component）
│   │
│   ├── teams/
│   │   ├── page.tsx            # チーム一覧（Server Component・ISR 3600秒）
│   │   └── [id]/
│   │       ├── page.tsx             # チーム詳細（Server Component・standings+matches並列取得）
│   │       └── TeamDetailClient.tsx # トレンドグラフ・試合リスト・ホーム/アウェイ（Client Component）
│   │
│   ├── charts/
│   │   ├── layout.tsx          # チャートサブナビ（Client Component・3タブ）
│   │   ├── race/
│   │   │   ├── page.tsx        # レースチャート（Server Component・ISR 3600秒）
│   │   │   └── RaceChart.tsx   # タブ切り替え・グラフ制御（Client Component）
│   │   ├── style/
│   │   │   └── page.tsx        # スタイル分析（Server Component・ISR 3600秒）
│   │   ├── home-away/
│   │   │   ├── page.tsx        # H/A比較（Server Component・ISR 3600秒）
│   │   │   └── HomeAwayClient.tsx # ランキング・棒グラフ・テーブル（Client Component）
│   │   └── simulator/
│   │       ├── page.tsx        # 順位予測シミュレーター（Server Component・ISR standings:3600秒/matches:1800秒）
│   │       └── SimulatorClient.tsx # H/D/A予測入力・リアルタイム順位表・サマリー（Client Component）
│   │
│   ├── quiz/
│   │   └── [matchId]/
│   │       └── page.tsx        # 試合別クイズページ（/quiz/liverpool-vs-brighton など）
│   │
│   └── articles/
│       ├── page.tsx            # 記事一覧（Server Component）
│       ├── ArticlesView.tsx    # タグフィルター・カード一覧（Client Component）
│       └── [slug]/
│           └── page.tsx        # 記事詳細（Server Component・MDXRemote）
│
├── components/
│   ├── ui/
│   │   └── Header.tsx          # 共通ヘッダー（2行構成・6項目ナビ・Client Component）
│   ├── mdx/
│   │   └── MdxComponents.tsx   # MDX用カスタムコンポーネント（h2/h3/p/ul/ol など）
│   ├── JsonLd.tsx              # JSON-LD構造化データ出力コンポーネント
│   ├── FeaturedMatchCard.tsx   # 次の注目カード（直近5試合・けが人・クイズリンク）
│   └── charts/
│       ├── chart-shared.tsx    # チャート共通型・buildChartData・CustomTooltip
│       ├── RaceChartPC.tsx     # レースチャート PC版（500px・全機能）
│       ├── RaceChartSP.tsx     # レースチャート SP版（360px・簡略表示）
│       ├── StyleChartPC.tsx    # スタイル分析散布図 PC版（500px）
│       └── StyleChartSP.tsx    # スタイル分析散布図 SP版（360px）
│
├── lib/
│   ├── football-api.ts         # football-data.org API ラッパー関数群（getPlayer追加）
│   ├── articles.ts             # 記事取得ユーティリティ（MDXファイル操作）
│   ├── mock/
│   │   ├── player-sns.ts       # 選手SNSアカウント モックデータ（PlayerSNS型）
│   │   ├── player-stats.ts     # 選手詳細スタッツ モックデータ（PlayerDetailStats型）
│   │   └── player-career.ts    # 選手キャリア履歴 モックデータ（PlayerCareer型）
│   ├── chart-utils.ts          # チャート用データ加工関数群
│   ├── simulator-utils.ts      # シミュレーター用型・matchToSimulator・calcSimulation
│   ├── team-colors.ts          # チームID → チームカラー定義
│   ├── match-preview-data.ts   # 次の注目カード静的設定（チーム情報・けが人・出場停止）
│   ├── match-quiz-data.ts      # 試合別クイズデータ（/quiz/[matchId] で使用）
│   └── utils.ts                # 汎用ユーティリティ（UTC→JST変換など）
│
├── types/
│   └── football.ts             # football-data.org API レスポンス型定義
│
├── content/
│   └── articles/               # MDX記事ファイル置き場
│       └── *.mdx               # 各記事ファイル（フロントマター付き）
│
├── docs/                       # ドキュメント（本ディレクトリ）
│   ├── README.md
│   ├── architecture.md
│   ├── design.md
│   ├── api.md
│   └── screens/
│       ├── index.md
│       ├── top.md
│       ├── standings.md
│       ├── matches.md
│       ├── scorers.md
│       ├── charts-race.md
│       ├── charts-style.md
│       ├── charts-home-away.md
│       ├── simulator.md
│       └── articles.md
│
├── public/                     # 静的ファイル
├── .env.local                  # 環境変数（Git管理外）
├── .gitignore
├── next.config.ts              # Next.js設定（画像ドメイン許可など）
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── CLAUDE.md                   # Claude Code向け開発指示
```

---

## 環境変数一覧

| 変数名 | 用途 | 設定場所 |
|--------|------|---------|
| `FOOTBALL_DATA_API_KEY` | football-data.org API 認証キー（サーバーサイド専用） | `.env.local` / Vercel 環境変数 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 測定ID | `.env.local` / Vercel 環境変数 |
| `NEXT_PUBLIC_SITE_URL` | サイトのベースURL（OGPなどで使用） | `.env.local` / Vercel 環境変数 |

> **注意**: `.env.local` は `.gitignore` の対象。本番環境の値は Vercel ダッシュボードで設定。

---

## デプロイフロー

```
ローカルで開発
  │
  ▼
git push origin main
  │
  ▼
Vercel が自動検知
  │
  ▼
npm run build（Next.js ビルド）
  │
  ▼
Vercel エッジネットワークにデプロイ
  │
  ▼
https://premier-insight.vercel.app/ で公開
```

- `main` ブランチへのプッシュで自動デプロイ
- ISRキャッシュはデプロイ後に自動的にウォームアップされる
- 環境変数は Vercel ダッシュボードの「Settings > Environment Variables」で管理
