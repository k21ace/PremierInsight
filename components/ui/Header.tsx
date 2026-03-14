"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/standings", label: "順位表" },
  { href: "/matches", label: "試合結果" },
  { href: "/scorers", label: "得点王" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-12 overflow-x-auto">
        <Link
          href="/"
          className="font-bold text-violet-600 shrink-0 text-sm tracking-tight"
        >
          PremierInsight
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm rounded transition-colors shrink-0 ${
                  isActive
                    ? "text-violet-600 font-semibold bg-violet-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
