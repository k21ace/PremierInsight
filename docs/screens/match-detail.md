# マッチレポート

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | マッチレポート |
| URL | `/matches/[id]` |
| `page.tsx` | `app/matches/[id]/page.tsx` |
| 目的 | 1試合のスコア・タイムライン・スタッツ・得点者・審判を表示する |

ユーザーができること:
- スコア・前後半スコアを確認
- 得点・カード・交代のタイムラインを時系列で確認（ホーム左・アウェイ右）
- チームスタッツ（得点/カード/交代数）を左右比較で確認
- 得点者と分・アシスト・種別（PK/OG）を確認
- 主審名を確認

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `MatchDetailPage` | `app/matches/[id]/page.tsx` | Server Component。試合詳細データ取得・全セクション表示 |
| `EventIcon` | `app/matches/[id]/page.tsx`（内部） | タイムラインイベントアイコン |
| `Image`（Next.js） | 組み込み | エンブレム画像表示 |

---

## 3. データ取得

| 関数名 | エンドポイント | revalidate | 用途 |
|--------|--------------|-----------|------|
| `getMatch(id)` | `GET /matches/{id}` | 300秒 | 試合詳細（得点・カード・交代・審判） |

---

## 4. セクション構成

| セクション | 内容 | 表示条件 |
|-----------|------|---------|
| ヘッダー | 節・日時・エンブレム・スコア・前半スコア・会場 | 常時表示 |
| タイムライン | 得点/カード/交代の時系列（ホーム左・アウェイ右） | イベントあり or SCHEDULED時は「詳細なし」メッセージ |
| スタッツ | 得点/前後半/カード/交代を左右比較 | FINISHED / IN_PLAY |
| 得点者詳細 | ⚽分 名前（アシスト）[チーム] | 得点ありかつ FINISHED / IN_PLAY |
| 審判 | 主審名 | `referees[]` あり |

---

## 5. タイムラインイベント型

```typescript
type EventType = "goal" | "own_goal" | "penalty" | "yellow" | "red" | "yellow_red" | "sub"

interface TimelineEvent {
  minute: number
  type: EventType
  side: "home" | "away"
  playerName: string
  assistName?: string
  playerInName?: string
}
```

---

## 6. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"${home} ${score} ${away} | PremierNow"` |
| `description` | `"第${matchday}節 ${home} vs ${away} のマッチレポート"` |

---

## 7. エラーハンドリング

- 試合IDが不正・APIエラーの場合は `notFound()` を返す
- SCHEDULED で timeline が空の場合は「試合前のため詳細データはありません」を表示
