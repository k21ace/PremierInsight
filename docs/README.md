# PremierInsight ドキュメント

プレミアリーグのデータを日本語で分析・可視化するサイト「PremierInsight」の技術ドキュメントです。

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| サイト名 | PremierInsight |
| コンセプト | プレミアリーグのデータを日本語で分析・可視化するサイト |
| ターゲット | プレミアリーグを深く楽しみたい日本人 |
| 本番URL | https://premier-insight.vercel.app/ |
| 対象リーグ | イングランド プレミアリーグ（PL） |

---

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [architecture.md](architecture.md) | システム構成・技術スタック・ディレクトリ構成・環境変数・デプロイフロー |
| [design.md](design.md) | デザインガイドライン（カラーパレット・タイポグラフィ・コンポーネント原則） |
| [api.md](api.md) | football-data.org API仕様・エンドポイント一覧・エラーハンドリング |
| [screens/index.md](screens/index.md) | 全画面のサマリー一覧 |
| [screens/quiz.md](screens/quiz.md) | クイズ一覧・クイズ詳細 |
| [screens/top.md](screens/top.md) | トップページ |
| [screens/standings.md](screens/standings.md) | 順位表 |
| [screens/matches.md](screens/matches.md) | 試合結果・日程 |
| [screens/scorers.md](screens/scorers.md) | 得点王ランキング |
| [screens/players.md](screens/players.md) | 選手スタッツ一覧・選手詳細 |
| [screens/charts-race.md](screens/charts-race.md) | レースチャート |
| [screens/charts-style.md](screens/charts-style.md) | スタイル分析（散布図） |
| [screens/articles.md](screens/articles.md) | 記事一覧・記事詳細 |

---

## 開発環境のセットアップ

### 前提条件

- Node.js 18 以上
- npm

### 手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd PremierInsight

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集して FOOTBALL_DATA_API_KEY などを設定

# 4. 開発サーバーを起動
npm run dev
```

### 環境変数

| 変数名 | 取得先 |
|--------|--------|
| `FOOTBALL_DATA_API_KEY` | https://www.football-data.org/ でアカウント登録後に取得 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 の測定ID |
| `NEXT_PUBLIC_SITE_URL` | サイトのベースURL（例: `https://premier-insight.vercel.app`） |

詳細は [architecture.md](architecture.md) を参照してください。

---

## 運用ルール

- **画面を追加・変更したら** `docs/screens/` の該当ファイルを更新する
- **新しいAPIエンドポイントを追加したら** `docs/api.md` を更新する
- **コンポーネントを追加したら** `docs/architecture.md` のディレクトリ構成を更新する
- **実装前にドキュメントを参照**し、設計の整合性を確認する
