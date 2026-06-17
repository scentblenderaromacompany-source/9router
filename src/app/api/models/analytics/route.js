import { NextResponse } from "next/server";
import { getUsageStats, getChartData } from "@/lib/usageDb";

// GET /api/models/analytics - Get model usage analytics and reporting
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const provider = searchParams.get("provider");
    const model = searchParams.get("model");

    const stats = await getUsageStats(period);
    const chartData = await getChartData(period);

    // Filter by provider/model if specified
    let filteredStats = stats;
    let filteredChartData = chartData;

    if (provider) {
      filteredStats = stats.filter((s) => s.provider === provider);
      filteredChartData = chartData.filter((d) => d.provider === provider);
    }

    if (model) {
      filteredStats = filteredStats.filter((s) => s.model === model);
      filteredChartData = filteredChartData.filter((d) => d.model === model);
    }

    return NextResponse.json({
      stats: filteredStats,
      chartData: filteredChartData,
      period,
      totalRequests: filteredStats.reduce((sum, s) => sum + s.requests, 0),
      totalTokens: filteredStats.reduce((sum, s) => sum + s.inputTokens + s.outputTokens, 0),
      totalCost: filteredStats.reduce((sum, s) => sum + s.cost, 0),
    });
  } catch (error) {
    console.error("[API] Error fetching model analytics:", error);
    return NextResponse.json({ error: "Failed to fetch model analytics" }, { status: 500 });
  }
}
