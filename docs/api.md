# football-data.org API 仕様

## API概要

| 項目 | 内容 |
|------|------|
| ベースURL | `https://api.football-data.org/v4` |
| 認証方式 | リクエストヘッダー `X-Auth-Token: {APIキー}` |
| 無料プラン 月間制限 | 無制限 |
| 無料プラン 分間制限 | **10リクエスト / 分** |
| レスポンス形式 | JSON |

---

## エンドポイント一覧

| エンドポイント | 関数名 | 用途 | revalidate |
|--------------|--------|------|-----------|
| `GET /competitions/PL/standings` | `getStandings()` | 順位表取得（TOTAL） | 3600秒（1時間） |
| `GET /competitions/PL/standings?standingType={type}` | `getStandingsByType(type)` | HOME / AWAY / TOTAL 個別取得 | 3600秒（1時間） |
| `GET /competitions/PL/standings` + `GET /competitions/PL/matches` | `getStandingsWithForm()` | 順位表＋直近5試合フォームを付与 | 3600秒 / 1800秒 |
| `GET /competitions/PL/matches` | `getMatches(options?)` | 試合一覧取得（節・ステータスで絞り込み可） | 1800秒（30分） |
| `GET /competitions/PL/matches` | `getCurrentMatchday()` | 現在の節番号を取得（`getMatches()`経由） | 1800秒 |
| `GET /competitions/PL/scorers` | `getScorers()` | 得点王ランキング取得 | 21600秒（6時間） |
| `GET /persons/{id}` | `getPlayer(id)` | 選手詳細情報取得 | 86400秒（24時間） |
| `GET /persons/{id}` × N | `getTransferredPlayerIds(playerIds, teamId)` | 注目カードの負傷者リストから移籍済み選手IDを検出 | getPlayer に準じて24時間 |
| `GET /matches/{id}` | `getMatch(id)` | 試合詳細取得（得点・カード・交代・審判） | 300秒（5分） |
| `GET /competitions/PL/matches?status=SCHEDULED` + `TIMED` + `GET /matches/{id}` | `getFeaturedMatchDetail(homeTeamId, awayTeamId)` | 注目カード用試合詳細取得（venue を含む） | 1800秒（検索）+ 300秒（detail） |

> `getStandingsWithForm()` は standings と matches の2リクエストを `Promise.all` で並列実行する。
> `getStandingsByType()` は H/A比較ページで HOME・AWAY を個別取得するために使用。無料プランでは `standingType` パラメータなしだと HOME/AWAY が返らないケースがある。
> `getPlayer(id)` は `/persons/{id}` エンドポイントを使用。404の場合はページ側で `notFound()` を呼ぶ。

---

## 主要な型定義

型定義ファイル: `types/football.ts`

### Standing（順位表1行）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `position` | `number` | 順位（1〜20） |
| `team.id` | `number` | チームID |
| `team.name` | `string` | チーム名（フルネーム） |
| `team.shortName` | `string` | 略称 |
| `team.tla` | `string` | 3文字略称（例: ARS, LIV） |
| `team.crest` | `string` | エンブレム画像URL |
| `playedGames` | `number` | 試合数 |
| `won` | `number` | 勝利数 |
| `draw` | `number` | 引き分け数 |
| `lost` | `number` | 敗北数 |
| `points` | `number` | 勝点 |
| `goalsFor` | `number` | 得点数 |
| `goalsAgainst` | `number` | 失点数 |
| `goalDifference` | `number` | 得失点差 |
| `form` | `string[]` | 直近5試合のW/D/L（無料プランではnull → 自前計算） |

### Match（試合情報）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `number` | 試合ID |
| `utcDate` | `string` | 試合日時（UTC, ISO 8601形式） |
| `status` | `MatchStatus` | ステータス（SCHEDULED / FINISHED / IN_PLAY など） |
| `matchday` | `number` | 節番号（1〜38） |
| `homeTeam` | `Team` | ホームチーム情報 |
| `awayTeam` | `Team` | アウェイチーム情報 |
| `score.fullTime.home` | `number \| null` | ホームスコア |
| `score.fullTime.away` | `number \| null` | アウェイスコア |
| `goals` | `Goal[] \| null` | 得点者一覧 |

### PersonResponse（選手詳細）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `number` | 選手ID |
| `name` | `string` | 選手名 |
| `dateOfBirth` | `string` | 生年月日（ISO 8601形式） |
| `nationality` | `string` | 国籍 |
| `position` | `string` | ポジション |
| `shirtNumber` | `number \| null` | 背番号 |
| `currentTeam` | `Team \| null` | 現在の所属チーム |

### Scorer（得点王1エントリー）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `player.id` | `number` | 選手ID |
| `player.name` | `string` | 選手名 |
| `team` | `Team` | 所属クラブ |
| `goals` | `number` | 得点数 |
| `assists` | `number \| null` | アシスト数（未集計の場合null） |
| `playedMatches` | `number` | 出場試合数 |
| `penalties` | `number \| null` | PKによる得点数 |

---

## エラーハンドリング方針

`lib/football-api.ts` の共通フェッチ関数（`fetchFootball`）で以下を実装:

1. **APIキー未設定**: `FOOTBALL_DATA_API_KEY` が存在しない場合は即 `Error` を throw
2. **HTTPエラー**: `res.ok` が false の場合（4xx/5xx）は `Error` を throw
   - エラーメッセージ例: `"Football API エラー [429]: Too Many Requests — /competitions/PL/matches"`
3. **ページ側の対処**: Next.js の Error Boundary（`error.tsx`）または `notFound()` でハンドリング

> **注意**: 無料プランは **10リクエスト / 分** の制限がある。
> 開発中に `/charts/race` ページ（2リクエスト並列）と順位表（2リクエスト並列）を
> 短時間に繰り返しアクセスするとレート制限に引っかかる場合がある。

---

## 画像ドメインの許可設定

エンブレム画像は `https://crests.football-data.org` から配信される。
`next.config.ts` にて `remotePatterns` で許可設定済み:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "crests.football-data.org" }
  ]
}
```
