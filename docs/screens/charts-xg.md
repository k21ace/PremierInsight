# xG分析

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | xG分析 |
| URL | `/charts/xg` |
| `page.tsx` | `app/charts/xg/page.tsx` |
| 関連コンポーネント | `app/charts/xg/XgClient.tsx` |
| データソース | Understat（`lib/understat.ts`） |
| 目的 | プレミアリーグ全チーム・選手の xG（ゴール期待値）を可視化し、決定力を分析する |

ユーザーができること:
- チーム別 xG vs 実得点を横棒グラフで比較
- xG vs 実得点の散布図で決定力（対角線より上＝高い）を一目で確認
- 選手別 xG ランキング TOP20 をテーブルで確認（xG・実得点・差分・npxG）
- xGの概念説明カード（画面下部）で指標の意味を理解

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `XgPage` | `app/charts/xg/page.tsx` | Server Component。データ取得・エラーハンドリング |
| `XgClient` | `app/charts/xg/XgClient.tsx` | Client Component。Recharts グラフ・ランキングテーブル |
| `ChartsLayout` | `app/charts/layout.tsx` | チャートサブナビ |

---

## 3. データ取得

| 関数名 | データソース | revalidate | 用途 |
|--------|------------|-----------|------|
| `getUnderstatTeams(2025)` | Understat（スクレイピング） | 86400秒 | チーム別 xG・実得点データ |
| `getUnderstatPlayers(2025)` | Understat（スクレイピング） | 86400秒 | 選手別 xG・npxG・実得点データ |

`calcTeamXgStats(teamsData)` で `TeamXgStats[]` に変換してクライアントコンポーネントへ渡す。

Understat はセッション Cookie を自動取得してデータを取得する（`getSessionCookie()`）。
API 失敗時はエラーメッセージを表示（ページ自体はクラッシュしない）。

---

## 4. 画面構成（XgClient）

| セクション | 内容 |
|-----------|------|
| チーム別 xG vs 実得点 | 横棒グラフ（`BarChart`）。xG（水色）・実得点（紺）を並列表示 |
| xG vs 実得点 散布図 | `ScatterChart`。y=x 対角線より上＝決定力高い（緑●）、下＝低い（赤●）|
| 選手別 xG ランキング TOP20 | テーブル。xG 降順。xG・実得点・差分・npxG 列 |
| 選手別 xA ランキング TOP20 | テーブル。xA 降順。xA・実アシスト・差分・KP（キーパス数）列 |
| xGとは？ | 説明カード（水色） |
| xAとは？ | 説明カード（紫）。xA・KP・実アシストとの関係を解説 |

---

## 5. 型定義（lib/understat.ts）

| 型名 | フィールド | 用途 |
|------|----------|------|
| `TeamXgStats` | `teamName, xG, scored, xGDiff` | 散布図・バーチャート |
| `UnderstatPlayer` | `player_name, team_title, xG, npxG, goals, xA, assists, key_passes` | xG・xA 選手ランキングテーブル |

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ xG（ゴール期待値）分析 2025-26 | PremierNow"` |
| `description` | `"プレミアリーグ全チーム・選手のxG（ゴール期待値）ランキング。決定力が高いチーム・選手を分析します。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+xG+分析+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |

---

## 7. 既知の課題・TODO

- Understat はスクレイピングベースのため、サイト構造の変更で取得失敗する可能性がある
- チーム名の短縮処理がクライアント側でハードコードされている（`replace` の連鎖）
- npxG（ノーPK期待得点）列・KP（キーパス数）列はSP幅では非表示（`hidden sm:table-cell`）
