import { NextResponse } from "next/server";
import { getDisabledModels, disableModels, enableModels } from "@/lib/disabledModelsDb";
import { getProviderConnections } from "@/lib/localDb";

// POST /api/models/bulk-operations - Perform bulk operations on models
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, provider, models } = body;

    if (!action || !provider || !models || !Array.isArray(models)) {
      return NextResponse.json(
        { error: "Action, provider, and models array are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "disable":
        await disableModels(provider, models);
        return NextResponse.json({ success: true, message: `Disabled ${models.length} models` });

      case "enable":
        await enableModels(provider, models);
        return NextResponse.json({ success: true, message: `Enabled ${models.length} models` });

      case "clearCooldown": {
        const connections = await getProviderConnections({ provider });
        const MODEL_LOCK_PREFIX = "modelLock_";

        await Promise.all(
          connections
            .filter((connection) => connection[MODEL_LOCK_PREFIX])
            .map((connection) =>
              updateProviderConnection(connection.id, {
                [MODEL_LOCK_PREFIX]: null,
                ...(connection.testStatus === "unavailable"
                  ? {
                      testStatus: "active",
                      lastError: null,
                      lastErrorAt: null,
                      backoffLevel: 0,
                    }
                  : {}),
              })
            )
        );

        return NextResponse.json({ success: true, message: "Cleared cooldown for models" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API] Error in bulk operations:", error);
    return NextResponse.json({ error: "Failed to perform bulk operation" }, { status: 500 });
  }
}
