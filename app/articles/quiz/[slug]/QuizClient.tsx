"use client";

import { useState } from "react";
import Link from "next/link";
import type { Quiz } from "@/lib/quiz-data";

type AnswerRecord = {
  correct: boolean;
  userAnswer: string;
};

function ScoreMessage({ score, total }: { score: number; total: number }) {
  if (score === total) return <p className="text-gray-600">完璧！PLマスターです！</p>;
  if (score === total - 1) return <p className="text-gray-600">素晴らしい！PLに詳しいですね！</p>;
  if (score === total - 2) return <p className="text-gray-600">なかなかの知識です！</p>;
  return <p className="text-gray-600">もっとPLを勉強しましょう！</p>;
}

export default function QuizClient({ quiz }: { quiz: Quiz }) {
  const total = quiz.questions.length;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [textInput, setTextInput] = useState("");

  const question = quiz.questions[currentQuestion];

  function checkAnswer(answer: string): boolean {
    if (question.type === "choice") {
      return answer === question.correctAnswer;
    }
    return answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  }

  function handleChoiceSelect(index: number) {
    if (isAnswered) return;
    const ans = String(index);
    const correct = checkAnswer(ans);
    setUserAnswer(ans);
    setIsAnswered(true);
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { correct, userAnswer: ans }]);
  }

  function handleTextSubmit() {
    if (isAnswered || textInput.trim() === "") return;
    const ans = textInput.trim();
    const correct = checkAnswer(ans);
    setUserAnswer(ans);
    setIsAnswered(true);
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { correct, userAnswer: ans }]);
  }

  function handleNext() {
    if (currentQuestion + 1 >= total) {
      setIsFinished(true);
    } else {
      setCurrentQuestion((n) => n + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setTextInput("");
    }
  }

  function handleReset() {
    setCurrentQuestion(0);
    setUserAnswer("");
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
    setTextInput("");
  }

  const shareText = `【PLクイズ】${quiz.title}\n${score}/${total}問正解！\n#プレミアリーグ #PremierNow\nhttps://premiernow.jp/articles/quiz/${quiz.slug}`;

  // ── 結果発表フェーズ ─────────────────────────────────
  if (isFinished) {
    return (
      <div className="space-y-6">
        {/* スコア */}
        <div className="bg-white border border-gray-200 rounded p-6 text-center shadow-sm">
          <p className="text-4xl font-bold font-mono tabular-nums text-pn-blue mb-2">
            {score} / {total}問 正解！
          </p>
          <ScoreMessage score={score} total={total} />
          {/* 星 */}
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`text-2xl ${i < score ? "text-pn-blue" : "text-gray-200"}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* 振り返り */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            問題の振り返り
          </p>
          {quiz.questions.map((q, i) => {
            const rec = answers[i];
            const displayAnswer =
              q.type === "choice" && q.options
                ? q.options[Number(rec?.userAnswer)] ?? rec?.userAnswer
                : rec?.userAnswer;
            const correctDisplay =
              q.type === "choice" && q.options
                ? q.options[Number(q.correctAnswer)]
                : q.correctAnswer;

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Q{i + 1}. {q.question}
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-20 shrink-0">あなたの回答</span>
                    <span
                      className={
                        rec?.correct ? "text-green-600 font-medium" : "text-red-500 font-medium"
                      }
                    >
                      {rec?.correct ? "✓" : "✗"} {displayAnswer}
                    </span>
                  </div>
                  {!rec?.correct && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-20 shrink-0">正解</span>
                      <span className="text-green-600 font-medium">{correctDisplay}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-gray-400 w-20 shrink-0">解説</span>
                    <span className="text-gray-600">{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* シェア + ボタン */}
        <div className="space-y-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-black text-white rounded px-5 py-2 text-sm hover:bg-gray-800 transition-colors"
          >
            𝕏 でシェアする
          </a>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 text-sm border border-pn-navy text-pn-blue rounded px-4 py-2 hover:bg-pn-blue-light transition-colors"
            >
              もう一度挑戦
            </button>
            <Link
              href="/articles/quiz"
              className="flex-1 text-center text-sm bg-gray-100 text-gray-700 rounded px-4 py-2 hover:bg-gray-200 transition-colors"
            >
              他のクイズへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 問題表示フェーズ ─────────────────────────────────
  const progress = ((currentQuestion) / total) * 100;

  return (
    <div className="space-y-5">
      {/* プログレスバー */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            問題 {currentQuestion + 1} / {total}
          </span>
          <span className="text-xs text-gray-400">
            {score}問正解中
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-pn-navy h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-pn-blue-light text-pn-navy border border-pn-blue-light px-2 py-0.5 rounded">
            {question.type === "choice" ? "4択" : "記述式"}
          </span>
          <span className="text-xs text-gray-400">Q{currentQuestion + 1}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* 4択 */}
      {question.type === "choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isCorrect = String(i) === question.correctAnswer;
            const isSelected = userAnswer === String(i);
            let cls =
              "w-full text-left text-sm px-4 py-3 rounded border transition-colors";
            if (!isAnswered) {
              cls += " bg-white border-gray-200 hover:border-pn-blue hover:bg-pn-blue-light";
            } else if (isCorrect) {
              cls += " bg-green-50 border-green-500 text-green-800";
            } else if (isSelected) {
              cls += " bg-red-50 border-red-500 text-red-800";
            } else {
              cls += " bg-white border-gray-200 text-gray-400";
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleChoiceSelect(i)}
                disabled={isAnswered}
              >
                <span className="font-mono tabular-nums mr-2 text-xs text-gray-400">
                  {["A", "B", "C", "D"][i]}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* 記述式 */}
      {question.type === "text" && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="答えを入力してください"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            disabled={isAnswered}
            className={`w-full border rounded px-4 py-3 text-sm focus:outline-none transition-colors ${
              isAnswered
                ? answers[answers.length - 1]?.correct
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
                : "border-gray-200 focus:border-pn-blue"
            }`}
          />
          {!isAnswered && (
            <button
              onClick={handleTextSubmit}
              disabled={textInput.trim() === ""}
              className="w-full text-sm bg-pn-navy text-white rounded px-4 py-3 hover:bg-pn-navy-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              回答する
            </button>
          )}
          {isAnswered && !answers[answers.length - 1]?.correct && (
            <p className="text-xs text-gray-500">
              正解:{" "}
              <span className="text-green-600 font-medium">
                {question.correctAnswer}
              </span>
            </p>
          )}
        </div>
      )}

      {/* 解説 */}
      {isAnswered && (
        <div
          className={`rounded p-4 text-sm border ${
            answers[answers.length - 1]?.correct
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p
            className={`font-medium mb-1 ${
              answers[answers.length - 1]?.correct
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {answers[answers.length - 1]?.correct ? "✓ 正解！" : "✗ 不正解"}
          </p>
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}

      {/* 次へボタン */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full text-sm bg-pn-navy text-white rounded px-4 py-3 hover:bg-pn-navy-dark transition-colors"
        >
          {currentQuestion + 1 >= total ? "結果を見る" : "次の問題へ →"}
        </button>
      )}
    </div>
  );
}
