# ホーム vs アウェイ 成績比較画面

## 概要

| 項目 | 内容 |
|------|------|
| パス | `/charts/home-away` |
| コンポーネント | `app/charts/home-away/page.tsx`（Server）・`app/charts/home-away/HomeAwayClient.tsx`（Client） |
| データソース | `getStandings()`（HOME / AWAY テーブル） |
| キャッシュ | 3600秒（1時間）ISR |
| ナビラベル | **H/A比較**（チャートサブナビ3番目） |

---

## データ加工

`lib/chart-utils.ts#calcHomeAwayStats(homeTable, awayTable)` で算出。

### HomeAwayStats 型

```ts
interface HomeAwayStatEntry {
  played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number;
  points: number; winRate: number; ppg: number;
}
interface HomeAwayStats {
  teamId: number; teamName: string; shortName: string; crestUrl: string;
  home: HomeAwayStatEntry;
  away: HomeAwayStatEntry;
  homeDiff: number;  // ホームPPG − アウェイPPG
}
```

standings の HOME / AWAY テーブルを `.find(s => s.type === "HOME")` で取得。

---

## セクション構成

### セクション1: ホーム強豪・アウェイ強豪 TOP5（2列グリッド）

| 列 | 内容 | ソート |
|---|---|---|
| 左: ホームが強いチーム | homeDiff 降順 TOP5 | green背景 |
| 右: アウェイが強いチーム | homeDiff 昇順 TOP5 | blue背景 |

各行: エンブレム + チーム名 + ホーム勝点 vs アウェイ勝点 + 差バッジ

差バッジの色:
- `+N.NN pt` → bg-green-50 text-green-700
- `-N.NN pt` → bg-blue-50 text-blue-700

### セクション2: 全チーム横棒グラフ（Recharts BarChart）

- `layout="vertical"` Y軸: shortName, X軸: 勝点
- ホームバー: `#7c3aed`（violet）/ アウェイバー: `#d1d5db`（gray）
- 各バー右端に LabelList で数値表示
- ソート: ホーム勝点の高い順
- カスタムTooltip: ホーム/アウェイの詳細スタッツ（試合数・W/D/L・得失点・勝点・PPG）
- カスタムLegend: ホーム（violet）→ アウェイ（gray）
- PC: ResponsiveContainer height=700 / SP: BarChart width=500 height=600（横スクロール対応）

### セクション3: 詳細テーブル（ホーム勝点降順）

| 列 | SP表示 |
|---|---|
| クラブ（エンブレム+shortName） | 表示 |
| H 試合・H 勝点 | 表示 |
| H 得点・H 失点 | md以上のみ |
| A 試合・A 勝点 | 表示 |
| A 得点・A 失点 | md以上のみ |
| 差（homeDiff） | 表示・色付き |

差の色分け: +0.5以上=green-600 / -0.5以下=blue-600 / それ以外=gray-400

---

## コンポーネント依存関係

```
app/charts/home-away/page.tsx (Server, revalidate: 3600)
  └── HomeAwayClient.tsx (Client)   ← セクション1〜3
  └── lib/chart-utils.ts#calcHomeAwayStats
  └── lib/football-api.ts#getStandings
```
