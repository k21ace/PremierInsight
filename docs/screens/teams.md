# チーム画面

## 概要

| 項目 | 内容 |
|------|------|
| パス | `/teams`（一覧）・`/teams/[id]`（詳細） |
| コンポーネント | `app/teams/page.tsx`（Server）・`app/teams/[id]/page.tsx`（Server）・`app/teams/[id]/TeamDetailClient.tsx`（Client） |
| データソース | `getStandings()`（一覧・詳細）・`getMatches({status:'FINISHED'})`（詳細） |
| キャッシュ | standings: 3600秒（1時間）・matches: 1800秒（30分） |
| ナビラベル | **チーム**（ヘッダー6項目中4番目） |

---

## /teams（チーム一覧）

### 表示内容

- `getStandings()` で取得した全20クラブをグリッド表示
- 2列（モバイル）〜5列（PC）のレスポンシブグリッド
- 順位帯ごとに左ボーダー色付き（UCL=青・UEL=オレンジ・UECL=薄オレンジ・降格=赤）

### カード内容

| 要素 | 内容 |
|---|---|
| エンブレム | 48×48 |
| クラブ名 | shortName |
| 順位 | `{position}位` |
| 勝点 | `{points}pt`（font-bold） |
| 成績 | `{won}勝{draw}分{lost}負` |

各カードは `/teams/[id]` へのリンク。

---

## /teams/[id]（チーム詳細）

### 構成

Server Component（`page.tsx`）が standings + finished matches を並列取得し、Client Component（`TeamDetailClient.tsx`）に渡す。

### データ取得（Server Component）

- `getStandings()` → TOTAL / HOME / AWAY の3テーブル取得
- `getMatches({status:'FINISHED'})` → 終了済み全試合
- チームIDでフィルター → 直近10試合（古い順）を `MatchSummary[]` に変換
- 存在しないIDは `notFound()` で404
- `getTeamInfo(teamId)` → 監督・スタジアム情報（任意・無料プランでは失敗の場合あり）
- `getUnderstatTeams(2025)` + `calcTeamXgStats()` → チームxGデータ（任意）
- `calcPointsTimeline()` + `calcProbabilities()` → 確率シミュレーション（任意）
- 試合ゴールデータから得点・アシストTop3を自前計算

### MatchSummary 型

```ts
interface MatchSummary {
  id: number;
  utcDate: string;
  isHome: boolean;
  opponentId: number;
  opponentName: string;
  opponentShortName: string;
  opponentCrest: string;
  scored: number;
  conceded: number;
  result: "W" | "D" | "L";
}
```

### セクション構成

#### ヘッダー（常時表示）
- エンブレム（64×64）+ チーム名（text-2xl）+ TLA
- 統計カード5枚: 順位・勝点・得点・失点・得失点差
- 勝/分/負 カウント
- 監督名・ホームスタジアム（取得できた場合のみ）

#### タブナビゲーション
- **成績** タブ（デフォルト）
- **分析** タブ

#### 成績タブ

- **トレンドグラフ**: Recharts LineChart（高さ180px）・2系列（得点blue/失点red）
- **直近試合リスト**: 直近10試合を新しい順で表示（日付・W/D/Lバッジ・H/A・相手エンブレム・相手名・スコア）
- **通算スタッツテーブル**: トータル・ホーム・アウェイの3行（試合数・勝・分・負・得点・失点・得失点差・勝点）

#### 分析タブ

- **確率予測**: 優勝確率・UCL出場確率・残留確率（モンテカルロシミュレーション）
- **xG 分析**: 期待得点(xG)・実際の得点・差／期待失点(xGA)・実際の失点・差（Understat データ）
- **攻撃スタイル分析**: 試合あたり得点・試合あたり失点・PPG
- **ホーム/アウェイ比較**: 勝率・勝点/試合・得点/試合・失点/試合のホーム/アウェイ比較
- **チーム内 得点ランキングTop3**（試合ゴールデータから計算）
- **チーム内 アシストランキングTop3**（試合ゴールデータから計算）

### generateMetadata
- title: `{チーム名} 成績・スタッツ 2025-26 | PremierNow`
- OGP画像: `/api/og?title=...` で動的生成

---

## コンポーネント依存関係

```
app/teams/page.tsx (Server)
  └── lib/football-api.ts#getStandings

app/teams/[id]/page.tsx (Server)
  └── TeamDetailClient.tsx (Client)   ← タブ・グラフ・リスト・分析セクション
  └── lib/football-api.ts#getStandings
  └── lib/football-api.ts#getMatches
  └── lib/football-api.ts#getTeamInfo        （任意: 監督・スタジアム）
  └── lib/understat.ts#getUnderstatTeams      （任意: xGデータ）
  └── lib/understat.ts#calcTeamXgStats
  └── lib/chart-utils.ts#calcPointsTimeline   （任意: 確率計算）
  └── lib/chart-utils.ts#calcProbabilities
  └── lib/translations.ts#getUnderstatTitle
```
