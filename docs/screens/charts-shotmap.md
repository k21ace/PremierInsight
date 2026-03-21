# シュートマップ

## 1. 画面概要

| 項目 | 内容 |
|------|------|
| 画面名 | シュートマップ |
| URL | `/charts/shotmap` |
| `page.tsx` | `app/charts/shotmap/page.tsx` |
| 関連コンポーネント | `app/charts/shotmap/ShotMapClient.tsx` |
| データソース | Understat（`lib/understat.ts` — `getTeamShots()`） |
| 目的 | プレミアリーグ各チームのシュート位置・xG をピッチ上にプロットして可視化する |

ユーザーができること:
- チームセレクターでチームを切り替え（20チーム）
- 全試合 / ホーム / アウェイ でフィルタリング
- シュートにホバーしてプレイヤー名・xG・結果・状況をツールチップで確認
- シュート総数・枠内・ゴール・xG の統計サマリーを確認

---

## 2. 使用コンポーネント一覧

| コンポーネント名 | ファイルパス | 役割 |
|----------------|------------|------|
| `ShotMapPage` | `app/charts/shotmap/page.tsx` | Server Component。初期データ取得・エラーハンドリング |
| `ShotMapClient` | `app/charts/shotmap/ShotMapClient.tsx` | Client Component。チーム選択・フィルタ・SVGピッチ・ツールチップ |

---

## 3. データ取得

| 関数名 | データソース | revalidate | 用途 |
|--------|------------|-----------|------|
| `getUnderstatTeams(2025)` | Understat（スクレイピング） | 86400秒 | チーム一覧（セレクター用） |
| `getTeamShots(teamTitle, 2025)` | Understat（スクレイピング） | 3600秒 | チームのシュートデータ |

- `getTeamShots()` は `https://understat.com/team/{teamName}/{season}` の HTML から `shotsData` 変数を抽出してパース
- `shotsData` には両チームのシュートが含まれるため、選択チームのシュートのみにフィルタリング
- API ルート `GET /api/understat/shots?team={title}&season={year}` 経由でクライアントがチーム切り替え時に再取得

---

## 4. 画面構成

| セクション | 内容 |
|-----------|------|
| コントロール | チームセレクター（`<select>`）・全試合/ホーム/アウェイ トグルボタン |
| 統計サマリー | シュート数・枠内数・ゴール数・xG合計（4カラムグリッド） |
| SVGピッチ | 攻撃ハーフ表示（中央ライン→ゴールライン）。シュートを丸でプロット |
| ツールチップ | ホバー時にプレイヤー名・結果・xG・時間・状況を表示 |
| 凡例 | ゴール・セーブ・枠外・ブロック・ポスト の色説明 |

---

## 5. SVGピッチ仕様

| 項目 | 値 |
|------|-----|
| viewBox | `-4 -4 572 428` |
| 表示範囲 | 攻撃ハーフ（52.5m × 68m） |
| スケール | sx=10.667px/m, sy=6.176px/m |
| 座標変換 | `svgX = (shot.X − 0.5) × 1120`, `svgY = shot.Y × 420` |
| フィールド色 | `#2e6b3e` |
| ライン色 | white, opacity=0.8 |

シュートドットの色分け（`result` フィールド）:

| result | 色 | ラベル |
|--------|-----|--------|
| `Goal` | #22c55e（緑） | ゴール |
| `SavedShot` | #f59e0b（琥珀） | セーブ |
| `MissedShots` | #ef4444（赤） | 枠外 |
| `BlockedShot` | #94a3b8（スレート） | ブロック |
| `ShotOnPost` | #a78bfa（紫） | ポスト |

シュートドットのサイズ: `r = 4 + xG × 10`（xG=0 → r=4px、xG=1 → r=14px）

---

## 6. 型定義（lib/understat.ts）

| 型名 | 主要フィールド | 用途 |
|------|--------------|------|
| `UnderstatShot` | `X, Y, xG, result, player, h_a, h_team, a_team, minute, situation` | シュートマッププロット用 |

---

## 7. API ルート

| エンドポイント | 用途 |
|--------------|------|
| `GET /api/understat/shots?team={title}&season={year}` | チームのシュートデータ JSON を返す |

---

## 8. SEO設定

| 項目 | 値 |
|------|-----|
| `title` | `"プレミアリーグ シュートマップ 2025-26 \| PremierNow"` |
| `description` | `"プレミアリーグ各チームのシュート位置をピッチ上にプロット。xG・決定機エリアを可視化します。"` |

---

## 9. 既知の課題・TODO

- Understat はスクレイピングベースのため、サイト構造の変更で取得失敗する可能性がある
- 攻撃ハーフのみ表示のため、センターライン付近からの遠距離シュートは左端にクランプされる
- モバイルではツールチップが画面端に隠れる場合がある（位置計算を改善余地あり）
