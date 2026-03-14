import Link from "next/link";

const navItems = [
  { href: "/standings", label: "順位表", description: "プレミアリーグ現在の順位" },
  { href: "/matches", label: "試合結果", description: "最新の試合スコアと日程" },
  { href: "/scorers", label: "得点王", description: "トップスコアラーランキング" },
  { href: "/articles", label: "分析記事", description: "戦術・データ分析コンテンツ" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
          PremierInsight
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10">
          プレミアリーグ データ分析サイト
        </p>
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                {item.label}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
