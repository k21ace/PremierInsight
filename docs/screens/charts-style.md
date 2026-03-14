# スタイル分析（散布図）

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | スタイル分析 |
| URL | `/charts/style` |
| `page.tsx` | `app/charts/style/page.tsx` |
| 関連コンポーネント | `components/charts/StyleChartPC.tsx`、`components/charts/StyleChartSP.tsx` |
| 目的 | プレミアリーグ全20チームの得点力（攻撃）と失点（守備）を散布図で可視化し、チームスタイルを分析する |

ユーザーができること:
- 全20チームのポジションを X軸（得点）× Y軸（失点・反転）の散布図で確認
- Y軸が反転しているため、右上ほど得点力・守備力ともに優れた「強豪」
- チームエンブレムをDotとして表示。ホバーでサイズが拡大（PC: 24px→30px / SP: 18px→22px）
- ホバーTooltipで得点・失点・勝点・平均勝点(ppg)を確認
- 平均値の点線で4象限に分割（視覚的な目安として）

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `StylePage` | `app/charts/style/page.tsx` | Server Component。データ取得・PC/SP切り替え |
| `StyleChartPC` | `components/charts/StyleChartPC.tsx` | ScatterChart PC版（500px・大きいDot） |
| `StyleChartSP` | `components/charts/StyleChartSP.tsx` | ScatterChart SP版（360px・小さいDot） |
| `ChartsLayout` | `app/charts/layout.tsx` | チャートサブナビ（レースチャート/スタイル分析） |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getStandings()` | `GET /competitions/PL/standings` | 3600秒 | 順位表から得点・失点・勝点を取得 |

`calcTeamStyles(table)` で `TeamStyle[]` に変換してチャートコンポーネントへ渡す。

---

## 4. APIレスポンス → 画面変数 対応表

`getStandings()` → `standings[TOTAL].table` → `calcTeamStyles()` → `teamStyles: TeamStyle[]`

| API項目名（英語） | 変数名（TypeScript） | 型 | 表示箇所 | 備考 |
|-----------------|-------------------|-----|--------|------|
| `standing.team.id` | `teamId` | `number` | clipPath ID生成・React key | — |
| `standing.team.name` | `teamName` | `string` | Tooltipのチーム名 | — |
| `standing.team.shortName` | `shortName` | `string` | 現在は未使用 | — |
| `standing.team.crest` | `crestUrl` | `string` | DotのSVG `<image href>` | エンブレム円形表示 |
| `standing.goalsFor` | `goalsFor` | `number` | X軸の値（得点） | X軸のデータキー |
| `standing.goalsAgainst` | `goalsAgainst` | `number` | Y軸の値（失点・反転） | Y軸のデータキー。`reversed` プロップで反転 |
| `standing.points` | `points` | `number` | Tooltip「勝点」行 | — |
| `standing.playedGames` | `played` | `number` | ppg計算に使用 | — |
| — | `ppg` | `number` | Tooltip「平均勝点」行 | `points / played` で計算 |
| `season.startDate` / `season.endDate` | `seasonLabel` | `string` | h1タイトル横のシーズン表記 | — |

---

## 5. 状態管理

`StyleChartPC` / `StyleChartSP` 内の `CrestDot` コンポーネントのみ state を持つ。

| コンポーネント | state名 | 型 | 初期値 | 役割 |
|-------------|---------|-----|-------|------|
| `CrestDot`（各Dot） | `hovered` | `boolean` | `false` | ホバー時にDotサイズを拡大（r: 12→15 / 9→11） |

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ 攻撃スタイル分析 2025-26 | PremierInsight"` |
| `description` | `"全20チームの得点力・守備力を散布図で可視化。チームの戦術傾向が一目でわかります。"` |
| OGP画像 | `/api/og?title=プレミアリーグ+攻撃スタイル分析+2025-26`（動的生成） |
| Twitter Card | `summary_large_image` |
| JSON-LD | なし |

---

## 7. 既知の課題・TODO

- Y軸ラベル「失点（守備力）」はRecarts組み込みのlabelではなくグラフ外のdiv（`writing-mode: vertical-rl`）で表示している（Rechartsの組み込みlabelでは日本語縦書きが崩れるため）
- 同じ位置にチームが密集すると Dot が重なる。現状は白縁（`r+1px`）で視覚的に区別するのみ
- SP版ではTooltipがタップ操作と相性が悪いため、ホバー以外の表示手段が未実装
