# クイズ画面

## 概要

| 項目 | 内容 |
|------|------|
| 一覧パス | `/articles/quiz` |
| 詳細パス | `/articles/quiz/[slug]` |
| コンポーネント | `app/articles/quiz/page.tsx`（Server）・`app/articles/quiz/[slug]/page.tsx`（Server）・`app/articles/quiz/[slug]/QuizClient.tsx`（Client） |
| データソース | `lib/quiz-data.ts`（静的データ） |
| キャッシュ | Static（ビルド時生成） |
| ナビラベル | 記事ページ・トップページから導線 |

---

## コンセプト

プレミアリーグの知識を試す4択・記述式混合クイズ。
ユーザーが問題に回答しながら進み、最後にスコアと振り返りを表示する。

---

## データ構造 (`lib/quiz-data.ts`)

```ts
type QuizQuestion = {
  id: number;
  question: string;
  type: "choice" | "text";
  options?: string[];      // 4択のみ
  correctAnswer: string;   // 4択: indexの文字列 / 記述: 正解テキスト
  explanation: string;
};

type Quiz = {
  slug: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  publishedAt: string;
  tags: string[];
};
```

---

## クイズ一覧 (`/articles/quiz`)

- 全クイズをカード形式で表示
- 「全N問」バッジ・「4択+記述混在」バッジ・タグ表示
- 「挑戦する →」ボタンで詳細へ遷移

---

## クイズ詳細 (`/articles/quiz/[slug]`)

### 状態管理（useState）

| 状態 | 型 | 説明 |
|------|----|------|
| `currentQuestion` | number | 現在の問題インデックス（0〜） |
| `userAnswer` | string | 選択したindex or 入力テキスト |
| `isAnswered` | boolean | 回答済みフラグ |
| `score` | number | 正解数 |
| `answers` | AnswerRecord[] | 全回答の記録 |
| `isFinished` | boolean | 全問終了フラグ |
| `textInput` | string | 記述式入力値 |

### 問題表示フェーズ

- プログレスバー（violet）+ 問題N/全問 表示
- **4択**: 回答前はhoverエフェクト、回答後に正解=green・不正解=red
- **記述式**: テキスト入力 + 「回答する」ボタン、Enter送信対応
  - 正誤判定: `trim().toLowerCase()` で比較
- 解説エリア（回答後に表示）
- 「次の問題へ」/「結果を見る」ボタン

### 結果発表フェーズ

- スコア大表示（N/5問 正解！）+ スコア帯別メッセージ
- ★表示（正解数=violet、残り=gray）
- 全問振り返り一覧（あなたの回答・正解・解説）
- 𝕏 シェアボタン
- 「もう一度挑戦」（状態リセット）・「他のクイズへ」

---

## 導線

| 場所 | 種類 |
|------|------|
| `app/page.tsx` | ピックアップ記事セクション下に「クイズに挑戦する →」リンク |
| `app/articles/page.tsx` | 記事一覧上部にバナー（bg-violet-50） |

---

## コンポーネント依存関係

```
app/articles/quiz/page.tsx (Server)
  └── lib/quiz-data.ts

app/articles/quiz/[slug]/page.tsx (Server)
  └── QuizClient.tsx (Client)   ← 全インタラクション
  └── lib/quiz-data.ts#getQuizBySlug
```
