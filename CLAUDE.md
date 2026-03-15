# PremierInsight — Claude への指示

## ナビゲーション一覧

| ラベル | パス |
|--------|------|
| 順位表 | /standings |
| 試合結果 | /matches |
| Player | /players |
| チーム | /teams |
| 分析 | /charts/race |
| 予測 | /simulator |
| 記事 | /articles |

## 開発ルール

- 新機能の開発前には必ず `docs/README.md` からドキュメントを参照すること
- 開発完了後には必ず関連ドキュメントを更新すること
  - 画面を追加・変更したら `docs/screens/` の該当ファイルを更新する
  - 新しいAPIエンドポイントを追加したら `docs/api.md` を更新する
  - コンポーネントを追加したら `docs/architecture.md` のディレクトリ構成を更新する

## デザインルール

- 実装時は `docs/design.md` のデザインガイドラインに必ず従う
- 白ベース・クリーンなデザイン（FBref / Sofascore スタイル）
- ページ背景は `bg-gray-50`・カードは `bg-white border border-gray-200`
- 数字には必ず `font-mono tabular-nums` をつける
- 角丸は `rounded` まで・シャドウは `shadow-sm` のみ・グラデーション禁止
- アクセントカラーは `violet-600` に統一
- フォントは日本語に Noto Sans JP・英数字に Inter を使用する
