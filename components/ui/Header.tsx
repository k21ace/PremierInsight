"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const primaryNavLinks = [
  { href: "/articles",    label: "記事",       activePrefix: "/articles" },
  { href: "/charts/race", label: "分析",       activePrefix: "/charts" },
  { href: "/standings",   label: "リーグデータ", activePrefix: null, leagueTab: true },
];

const leagueNavLinks = [
  { href: "/standings", label: "順位表", activePrefix: "/standings" },
  { href: "/matches",   label: "試合",   activePrefix: "/matches" },
  { href: "/players",   label: "選手",   activePrefix: "/players" },
  { href: "/teams",     label: "クラブ", activePrefix: "/teams" },
];

const leaguePrefixes = ["/standings", "/matches", "/players", "/teams"];

export default function Header() {
  const pathname = usePathname();
  const isLeagueActive = leaguePrefixes.some((p) => pathname.startsWith(p));

  return (
    <header className="overflow-x-hidden sticky top-0 z-50" style={{ backgroundColor: "#2d0a4e" }}>
      {/* 1行目: ロゴ */}
      <div className="max-w-5xl mx-auto px-4 pt-2 pb-1">
        <Link href="/" aria-label="PremierNow ホームへ">
          <Logo />
        </Link>
      </div>
      {/* 2行目: 第一階層ナビ */}
      <nav
        className="flex max-w-5xl mx-auto"
        style={{ borderTop: "1px solid #3a2a6a" }}
      >
        {primaryNavLinks.map(({ href, label, activePrefix, leagueTab }) => {
          const isActive = leagueTab ? isLeagueActive : (activePrefix ? pathname.startsWith(activePrefix) : false);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 text-center py-2 text-xs transition-colors font-medium ${
                isActive
                  ? "text-white border-b-2 border-[#00a8e8]"
                  : "text-[#7a8fc0] hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {/* 3行目: 第二階層ナビ（リーグデータ選択時のみ表示） */}
      {isLeagueActive && (
        <nav
          className="flex max-w-5xl mx-auto"
          style={{ borderTop: "1px solid #3a2a6a", backgroundColor: "#240840" }}
        >
          {leagueNavLinks.map(({ href, label, activePrefix }) => {
            const isActive = pathname.startsWith(activePrefix);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 text-center py-1.5 text-xs transition-colors font-medium ${
                  isActive
                    ? "text-white border-b-2 border-[#00a8e8]"
                    : "text-[#7a8fc0] hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
