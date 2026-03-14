# 記事一覧・記事詳細

## 1. 画面概要

### 記事一覧（`/articles`）

| 項目 | 内容 |
|------|------|
| 画面名 | 記事一覧 |
| URL | `/articles` |
| `page.tsx` | `app/articles/page.tsx` |
| 関連コンポーネント | `app/articles/ArticlesView.tsx` |
| 目的 | `content/articles/` 以下の全MDX記事をカード形式で一覧表示する |

ユーザーができること:
- 全記事を公開日降順で確認
- タグボタンでフィルタリング（例:「マッチレポート」のみ表示）
- 記事カードのタイトル・説明・公開日・読了時間・タグを確認
- 「続きを読む →」で記事詳細へ遷移

### 記事詳細（`/articles/[slug]`）

| 項目 | 内容 |
|------|------|
| 画面名 | 記事詳細 |
| URL | `/articles/[slug]` |
| `page.tsx` | `app/articles/[slug]/page.tsx` |
| 目的 | 指定slugのMDXファイルをレンダリングして記事本文を表示する |

ユーザーができること:
- 記事のタイトル・説明・公開日・読了時間・タグを確認
- MDXでフォーマットされた本文を読む
- 「← 前の記事」「次の記事 →」で前後の記事へ遷移
- 「← 記事一覧へ戻る」で一覧ページへ戻る

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `ArticlesPage` | `app/articles/page.tsx` | Server Component。記事一覧・タグ集計 |
| `ArticlesView` | `app/articles/ArticlesView.tsx` | Client Component。タグフィルター・カード一覧 |
| `ArticleDetailPage` | `app/articles/[slug]/page.tsx` | Server Component。記事取得・MDXレンダリング・前後ナビ |
| `MDXRemote` | `next-mdx-remote/rsc` | MDXコンテンツをサーバーサイドでHTMLに変換 |
| `mdxComponents` | `components/mdx/MdxComponents.tsx` | MDX内タグ（h2/h3/p/ul/ol/strong/blockquote/a）のスタイル定義 |

---

## 3. データ取得

APIは使用しない。ファイルシステムから直接取得。

| 関数名 | データ源 | 用途 |
|--------|---------|------|
| `getAllArticles()` | `content/articles/*.mdx` | 全記事メタデータを publishedAt 降順で取得 |
| `getArticleBySlug(slug)` | `content/articles/${slug}.mdx` | 指定記事のメタデータ＋本文を取得 |
| `getFeaturedArticles()` | `content/articles/*.mdx` | `featured: true` の記事を最大3件取得（トップページ用） |

---

## 4. MDXフロントマター → 変数 対応表

| フロントマター項目 | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `title` | `article.title` | `string` | 記事タイトル・`<title>`タグ | — |
| `description` | `article.description` | `string` | 説明文・`<meta description>` | — |
| `publishedAt` | `article.publishedAt` | `string` | 公開日（YYYY-MM-DD形式） | — |
| `matchday` | `article.matchday` | `number \| undefined` | 「第n節」表示 | 任意項目 |
| `tags` | `article.tags` | `string[]` | タグバッジ・フィルターボタン | — |
| `featured` | `article.featured` | `boolean \| undefined` | トップページピックアップ判定 | 任意項目 |
| ファイル名（拡張子除く） | `article.slug` | `string` | URL生成（`/articles/${slug}`） | `gray-matter` 解析後に付与 |
| 本文（frontmatter以降） | `article.content` | `string` | MDXRemoteへ渡す | `gray-matter` の `content` フィールド |
| — | `article.readingTime` | `string` | 「約n分」形式 | `reading-time` ライブラリで本文から計算 |

### MDXカスタムコンポーネント（`components/mdx/MdxComponents.tsx`）

| タグ | 適用スタイル |
|------|------------|
| `h2` | `text-xl font-semibold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2` |
| `h3` | `text-lg font-medium text-gray-900 mt-6 mb-3` |
| `p` | `text-gray-700 leading-relaxed mb-4` |
| `ul` | `text-gray-700 leading-relaxed mb-4 pl-6 list-disc` |
| `ol` | `text-gray-700 leading-relaxed mb-4 pl-6 list-decimal` |
| `strong` | `font-semibold text-gray-900` |
| `blockquote` | `border-l-4 border-violet-300 pl-4 text-gray-600 italic my-4` |
| `a` | `text-violet-600 hover:underline`（外部リンクは `target="_blank"` 付与） |

---

## 5. 状態管理

| コンポーネント | state名 | 型 | 初期値 | 役割 |
|-------------|---------|-----|-------|------|
| `ArticlesView` | `activeTag` | `string \| null` | `null` | 現在選択中のタグ。`null` = すべて表示 |

---

## 6. SEO設定

### 記事一覧

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 分析記事一覧 | PremierInsight"` |
| `description` | `"プレミアリーグの試合分析・データ解説記事。毎節更新。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+分析記事一覧`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | なし |

### 記事詳細

| 項目 | 値 |
|------|-----|
| `title` | `"${article.title} | PremierInsight"`（`generateMetadata` で動的生成） |
| `description` | `article.description`（フロントマターから） |
| OGP画像 | `/api/og?title=${encodeURIComponent(article.title)}`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | `Article` スキーマ（`headline`, `description`, `datePublished`, `publisher`） |

`generateStaticParams()` で全記事のslugを列挙し、ビルド時に静的生成。

---

## 7. 既知の課題・TODO

- 記事ファイルを追加してもビルド/再デプロイが必要（`revalidate = 3600` だが `generateStaticParams` によるSSGのため）
- タグフィルターは URL に反映されないため、ページリロードでフィルターがリセットされる
- 記事検索機能は未実装
