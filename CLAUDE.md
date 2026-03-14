# PremierInsight — Claude への指示

## 開発ルール

- 新機能の開発前には必ず `SPEC.md` を参照すること
- 開発完了後には必ず `SPEC.md` の該当箇所を更新すること
  - 未実装 → 実装済みになった機能はセクション6・7を更新する
- コンポーネント新規作成時・ページ実装時も `SPEC.md` を更新すること

## デザインルール

- 実装時は `SPEC.md` のデザインガイドライン（セクション9）に必ず従う
- 白ベース・クリーンなデザイン（FBref / Sofascore スタイル）
- ページ背景は `bg-gray-50`・カードは `bg-white border border-gray-200`
- 数字には必ず `font-mono tabular-nums` をつける
- 角丸は `rounded` まで・シャドウは `shadow-sm` のみ・グラデーション禁止
- アクセントカラーは `violet-600` に統一
- フォントは日本語に Noto Sans JP・英数字に Inter を使用する
