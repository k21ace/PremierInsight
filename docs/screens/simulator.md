# 順位予測シミュレーター画面

## 概要

| 項目 | 内容 |
|------|------|
| パス | `/simulator` |
| コンポーネント | `app/simulator/page.tsx`（Server）・`app/simulator/SimulatorClient.tsx`（Client） |
| データソース | `getStandings()`（現在順位）・`getMatches({status:'SCHEDULED'})`（未消化試合） |
| キャッシュ | standings: 3600秒 / matches: 1800秒 |
| ナビラベル | **予測**（ヘッダー7項目中6番目） |

---

## コンセプト

残り試合の結果を H/D/A で選択し、最終順位をリアルタイムでシミュレーションするインタラクティブツール。

---

## データフロー

Server Component:
- `getStandings()` → TOTAL standings → `Standing[]`
- `getMatches({ status: 'SCHEDULED' })` → `Match[]` → `SimulatorMatch[]`（`matchToSimulator()` で変換）
- 直近3節の matchday を `displayMatchdays: number[]` として渡す

Client Component（状態管理）:
- `predictions: Record<number, 'H' | 'D' | 'A'>` — matchId → 予測結果
- 変更のたびに `calcSimulation(standings, matchesWithPredictions)` を呼んで順位を再計算

---

## lib/simulator-utils.ts

### SimulatorMatch 型

```ts
type SimulatorMatch = {
  matchId, matchday,
  homeTeamId, homeTeamName, homeTeamShortName, homeTeamCrest,
  awayTeamId, awayTeamName, awayTeamShortName, awayTeamCrest,
  prediction: 'H' | 'D' | 'A' | null,
}
```

### TeamSimResult 型

```ts
type TeamSimResult = {
  teamId, teamName, shortName, crestUrl,
  currentPoints, predictedPoints,
  currentPosition, predictedPosition,
  positionChange,   // プラス = 上昇
  remainingMatches,
}
```

### calcSimulation(standings, matches): TeamSimResult[]

- prediction が null の試合は無視
- H=ホーム3pt / D=両チーム1pt / A=アウェイ3pt
- predictedPoints = currentPoints + 加算勝点
- predictedPoints 降順ソート → predictedPosition を付与
- positionChange = currentPosition - predictedPosition

---

## セクション構成

### セクション1: ヘッダー
- 説明テキスト + リセットボタン

### セクション2+3: 2カラムレイアウト（PC）/ 縦並び（SP）

**左カラム（w-5/12）: 試合予測入力**
- 直近3節分の未消化試合を節ごとにグループ表示
- 各試合: ホームエンブレム + shortName / H・D・A ボタン / アウェイエンブレム + shortName
- ボタン選択状態: H=green-500 / D=gray-400 / A=blue-500 / 未選択=white border
- 同じボタンを再クリックで解除

**右カラム（w-7/12）: 予測順位表**
- 列: 予測順位 / 変動 / クラブ / 現在勝点 / 予測勝点 / 残試合（sm以上）
- 変動: ↑N（green-600）/ ↓N（red-500）/ →（gray-300）
- 予測勝点に増分（+Npt）を緑で併記
- 予測なし時: 「試合結果を予測すると、順位表がリアルタイムで更新されます」

### セクション4: 予測サマリー
- 予測入力数 / 全試合数
- 最多勝点獲得チーム（+Npt）
- 最大順位上昇チーム（↑N位）
- 最大順位下降チーム（↓N位）

---

## コンポーネント依存関係

```
app/simulator/page.tsx (Server)
  └── SimulatorClient.tsx (Client)   ← 状態管理・全セクション
  └── lib/simulator-utils.ts         ← SimulatorMatch / TeamSimResult / calcSimulation
  └── lib/football-api.ts#getStandings
  └── lib/football-api.ts#getMatches
```
