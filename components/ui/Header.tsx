"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Newspaper, BarChart2, Trophy } from "lucide-react";
import Logo from "@/components/Logo";

const primaryNavLinks = [
  { href: "/articles",    label: "記事",        icon: Newspaper, activePrefix: "/articles" },
  { href: "/charts/race", label: "分析",        icon: BarChart2,  activePrefix: "/charts" },
  { href: "/standings",   label: "リーグデータ", icon: Trophy,     activePrefix: null, leagueTab: true },
];

const leagueNavLinks = [
  { href: "/standings", label: "順位表", activePrefix: "/standings" },
  { href: "/matches",   label: "試合",   activePrefix: "/matches" },
  { href: "/players",   label: "選手",   activePrefix: "/players" },
  { href: "/teams",     label: "クラブ", activePrefix: "/teams" },
];

const leaguePrefixes = ["/standings", "/matches", "/players", "/teams"];

const articlesNavLinks = [
  { href: "/articles",      label: "記事",   isActive: (p: string) => p.startsWith("/articles") && !p.startsWith("/articles/quiz") },
  { href: "/articles/quiz", label: "クイズ", isActive: (p: string) => p.startsWith("/articles/quiz") },
];

const chartsNavLinks = [
  { href: "/charts/race",      label: "レース", isActive: (p: string) => p.startsWith("/charts/race") },
  { href: "/charts/xg",        label: "xG · xA", isActive: (p: string) => p.startsWith("/charts/xg") },
  { href: "/charts/style",     label: "スタイル", isActive: (p: string) => p.startsWith("/charts/style") || p.startsWith("/charts/home-away") },
  { href: "/charts/simulator", label: "予想",   isActive: (p: string) => p.startsWith("/charts/simulator") },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-[#7a8fc0] hover:text-white transition-colors p-1.5 rounded"
      aria-label="テーマを切り替える"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isLeagueActive = leaguePrefixes.some((p) => pathname.startsWith(p));
  const isArticlesActive = pathname.startsWith("/articles");
  const isChartsActive = pathname.startsWith("/charts");

  const secondaryNav = isLeagueActive
    ? leagueNavLinks.map(({ href, label, activePrefix }) => ({ href, label, isActive: pathname.startsWith(activePrefix) }))
    : isArticlesActive
    ? articlesNavLinks.map(({ href, label, isActive }) => ({ href, label, isActive: isActive(pathname) }))
    : isChartsActive
    ? chartsNavLinks.map(({ href, label, isActive }) => ({ href, label, isActive: isActive(pathname) }))
    : null;

  return (
    <header className="overflow-x-hidden sticky top-0 z-50" style={{ backgroundColor: "#2d0a4e" }}>
      {/* 1行目: ロゴ + ナビ + テーマ切り替え */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-0">
        <Link href="/" aria-label="PremierNow ホームへ" className="shrink-0 w-[100px] h-[34px] sm:w-[130px] sm:h-[44px]">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 flex-1">
          {primaryNavLinks.map(({ href, label, icon: Icon, activePrefix, leagueTab }) => {
            const isActive = leagueTab ? isLeagueActive : (activePrefix ? pathname.startsWith(activePrefix) : false);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-[#7a8fc0] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
      {/* 2行目: 第二階層ナビ */}
      {secondaryNav && (
        <nav
          className="flex max-w-5xl mx-auto"
          style={{ borderTop: "1px solid #3a2a6a", backgroundColor: "#240840" }}
        >
          {secondaryNav.map(({ href, label, isActive }) => (
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
          ))}
        </nav>
      )}
    </header>
  );
}
