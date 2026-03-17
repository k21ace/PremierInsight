import { Instagram, Twitter, Youtube, Music2 } from "lucide-react";
import type { PlayerSNS } from "@/lib/mock/player-sns";

type Platform = PlayerSNS["sns"][number]["platform"];

export function SNSIcon({
  platform,
  size = "md",
}: {
  platform: Platform;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  switch (platform) {
    case "instagram": return <Instagram className={cls} />;
    case "x":        return <Twitter className={cls} />;
    case "youtube":  return <Youtube className={cls} />;
    case "tiktok":   return <Music2 className={cls} />;
  }
}
