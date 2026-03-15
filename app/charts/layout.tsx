"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const chartTabs = [
  { href: "/charts/race",      label: "レースチャート" },
  { href: "/charts/style",     label: "スタイル分析" },
  { href: "/charts/home-away", label: "H/A比較" },
];

export default function ChartsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* チャートサブナビ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {chartTabs.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  isActive
                    ? "border-violet-600 text-violet-600 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
