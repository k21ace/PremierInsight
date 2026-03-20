import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | PremierNow",
  description: "PremierNowのプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-pn-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          プライバシーポリシー
        </h1>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">サイトについて</h2>
            <p>
              PremierNow（premiernow.jp）は、プレミアリーグのデータを日本語で提供する個人運営サイトです。
              運営者：管理人
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">アクセス解析について</h2>
            <p>
              本サイトでは、Google LLC が提供する Google アナリティクスを使用しています。
              Google アナリティクスは Cookie を使用してアクセス情報を収集しますが、
              個人を特定する情報は収集しません。
              収集された情報は Google のプライバシーポリシーに基づいて管理されます。
            </p>
            <p className="mt-1">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a8e8] hover:underline"
              >
                Google プライバシーポリシー
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">広告について</h2>
            <p>
              本サイトは、Google LLC が提供する Google AdSense を掲載する予定です。
              Google AdSense は、ユーザーの興味に基づいた広告を表示するために Cookie を使用します。
              Cookie を無効にする場合は、ブラウザの設定から変更できます。
            </p>
            <p className="mt-1">
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a8e8] hover:underline"
              >
                Google 広告に関するポリシー
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Cookie について</h2>
            <p>
              本サイトでは、アクセス解析および広告配信のために Cookie を使用しています。
              Cookie はブラウザに保存される小さなデータファイルであり、個人情報は含まれません。
              ブラウザの設定により Cookie を無効にすることができますが、
              一部機能が正常に動作しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">免責事項</h2>
            <p>
              本サイトのデータは football-data.org API を使用しており、
              情報の正確性・完全性を保証するものではありません。
              本サイトの情報を利用したことによって生じた損害について、
              運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">お問い合わせ</h2>
            <p>
              ご意見・ご連絡は X（旧 Twitter）アカウントまでお願いします。
            </p>
            <p className="mt-1">
              <a
                href="https://x.com/PremierNow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a8e8] hover:underline"
              >
                @PremierNow_
              </a>
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
            最終更新：2026年3月
          </p>

        </div>
      </div>
    </main>
  );
}
