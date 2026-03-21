"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);

  // ルート変更完了でオーバーレイを非表示
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setLoading(false);
    }
  }, [pathname]);

  // 内部リンクのクリックでオーバーレイを表示
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // ミドルクリック・修飾キー付きクリックは新タブで開くためスキップ
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";

      // 外部リンク・ハッシュ・同一ページはスキップ
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href === "" ||
        href === pathname
      ) return;

      setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;
  return <LoadingOverlay />;
}
