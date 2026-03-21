import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "PremierNow";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#2d0a4e",
          padding: "64px",
        }}
      >
        {/* 上部アクセントライン */}
        <div
          style={{
            display: "flex",
            width: "80px",
            height: "5px",
            backgroundColor: "#00a8e8",
            borderRadius: "3px",
            marginBottom: "36px",
          }}
        />

        {/* タイトル */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.25,
              maxWidth: "1000px",
            }}
          >
            {title}
          </span>
        </div>

        {/* 下部：サイト名 ＋ 説明 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #3a2a6a",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                color: "#00a8e8",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              PremierNow
            </span>
            <span
              style={{
                color: "#7a8fc0",
                fontSize: 22,
              }}
            >
              プレミアリーグ データ分析サイト
            </span>
          </div>
          {/* デコレーション */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#00a8e8",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#3a2a6a",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#3a2a6a",
                borderRadius: "50%",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
