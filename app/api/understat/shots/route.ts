import { NextRequest, NextResponse } from "next/server";
import { getTeamShots } from "@/lib/understat";

/**
 * GET /api/understat/shots?team=Arsenal&season=2025
 * チームのシュートデータを返す（Understat スクレイピング経由）
 */
export async function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team");
  const seasonParam = req.nextUrl.searchParams.get("season");
  const season = seasonParam ? Number(seasonParam) : 2025;

  if (!team) {
    return NextResponse.json({ error: "team parameter is required" }, { status: 400 });
  }
  if (isNaN(season) || season < 2014 || season > 2030) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  try {
    const shots = await getTeamShots(team, season);
    return NextResponse.json(shots);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
