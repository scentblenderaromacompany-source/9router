import { NextResponse } from "next/server";
import { ModelFetcherScheduler } from "@/lib/modelFetchers/scheduler";
import { EnhancedModelFetcherScheduler } from "@/lib/modelFetchers/enhancedScheduler";
import { getProviderConnections } from "@/lib/localDb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { providerId, force = false, schedulerType = "enhanced" } = body;

    let scheduler;
    if (schedulerType === "enhanced") {
      scheduler = new EnhancedModelFetcherScheduler();
    } else {
      scheduler = new ModelFetcherScheduler();
    }

    if (providerId) {
      const connections = await getProviderConnections();
      const connection = connections.find((c) => c.provider === providerId && c.isActive);
      if (!connection) {
        return NextResponse.json({ error: "Provider not found or inactive" }, { status: 404 });
      }

      const fetcherClass = scheduler.getFetcherClass(providerId);
      if (!fetcherClass) {
        return NextResponse.json({ error: "No fetcher found for provider" }, { status: 400 });
      }

      const fetcher = new fetcherClass(providerId, connection, { force });
      const result = await fetcher.fetchAndUpdate();

      return NextResponse.json({
        success: true,
        provider: providerId,
        scheduler: schedulerType,
        result,
      });
    }

    const result = await scheduler.run();
    return NextResponse.json({
      success: true,
      scheduler: schedulerType,
      result,
    });
  } catch (error) {
    console.error("Model fetch API error:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schedulerType = searchParams.get("type") || "enhanced";

    let scheduler;
    if (schedulerType === "enhanced") {
      scheduler = new EnhancedModelFetcherScheduler();
    } else {
      scheduler = new ModelFetcherScheduler();
    }

    const isRunning = scheduler.isSchedulerRunning();
    const stats = await scheduler.getStats();

    return NextResponse.json({
      status: "ok",
      scheduler: {
        isRunning,
        type: schedulerType,
      },
      stats,
    });
  } catch (error) {
    console.error("Model fetch status API error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
