import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "PremierInsight";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          padding: "60px",
        }}
      >
        {/* サイト名（左上） */}
        <div
          style={{
            display: "flex",
            color: "#7c3aed",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          PremierInsight
        </div>

        {/* タイトル（中央） */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            color: "#111827",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          <span style={{ maxWidth: "1000px" }}>{title}</span>
        </div>

        {/* 下部：説明 ＋ アクセントライン */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: 20 }}>
            プレミアリーグ データ分析サイト
          </span>
          <div
            style={{
              width: 120,
              height: 6,
              backgroundColor: "#7c3aed",
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
