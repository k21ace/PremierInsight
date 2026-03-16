"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/articles",    label: "記事",     activePrefix: "/articles" },
  { href: "/charts/race", label: "分析",     activePrefix: "/charts" },
  { href: "/standings",   label: "順位表",   activePrefix: "/standings" },
  { href: "/matches",     label: "試合結果", activePrefix: "/matches" },
  { href: "/players",     label: "Player",   activePrefix: "/players" },
  { href: "/teams",       label: "チーム",   activePrefix: "/teams" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 overflow-x-hidden">
      {/* 1行目: サイト名 */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-1">
        <Link
          href="/"
          className="font-bold text-violet-600 text-base tracking-tight"
        >
          PremierInsight
        </Link>
      </div>
      {/* 2行目: ナビ */}
      <nav className="flex border-t border-gray-100 max-w-5xl mx-auto">
        {navLinks.map(({ href, label, activePrefix }) => {
          const isActive = pathname.startsWith(activePrefix);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 text-center py-2 text-xs transition-colors ${
                isActive
                  ? "text-violet-600 font-medium border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
