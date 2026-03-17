"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const chartTabs = [
  { href: "/charts/race",      label: "レースチャート" },
  { href: "/charts/style",     label: "スタイル分析" },
  { href: "/charts/home-away", label: "H/A比較" },
  { href: "/charts/xg",        label: "xG分析" },
  { href: "/charts/simulator", label: "順位予測" },
];

export default function ChartsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
      {/* チャートサブナビ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          {/* PC: タブ */}
          <div className="hidden md:flex gap-1">
            {chartTabs.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    isActive
                      ? "border-pn-blue text-pn-blue font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          {/* SP: セレクトボックス */}
          <div className="md:hidden py-2">
            <select
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:border-[#00a8e8] focus:outline-none"
            >
              {chartTabs.map(({ href, label }) => (
                <option key={href} value={href}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
