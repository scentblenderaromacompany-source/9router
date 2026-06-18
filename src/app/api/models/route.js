import { NextResponse } from "next/server";
import { getModelAliases, setModelAlias, deleteModelAlias } from "@/models";
import { getDisabledModels } from "@/lib/disabledModelsDb";
import { AI_MODELS } from "@/shared/constants/config";
import { getProviderAlias } from "@/shared/constants/providers";
import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";
import { getCustomModels, addCustomModel, deleteCustomModel } from "@/models";

// GET /api/models - Get models with aliases and custom models
export async function GET() {
  try {
    const modelAliases = await getModelAliases();
    const disabled = await getDisabledModels();
    const customModels = await getCustomModels();

    const models = AI_MODELS
      .filter((m) => {
        const alias = getProviderAlias(m.provider) || m.provider;
        const list = disabled[alias] || disabled[m.provider] || [];
        return !list.includes(m.model);
      })
      .map((m) => {
        const fullModel = `${m.provider}/${m.model}`;
        const c = getCapabilitiesForModel(m.provider, m.model);
        return {
          ...m,
          fullModel,
          alias: modelAliases[fullModel] || m.model,
          caps: { vision: c.vision, search: c.search, reasoning: c.reasoning },
        };
      });

    return NextResponse.json({
      models,
      customModels,
      aliases: modelAliases,
      disabled,
    });
  } catch (error) {
    console.log("Error fetching models:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

// POST /api/models - Create a new custom model
export async function POST(request) {
  try {
    const body = await request.json();
    const { providerAlias, id, type = "llm", name } = body;

    if (!providerAlias || !id) {
      return NextResponse.json(
        { error: "Provider alias and model ID are required" },
        { status: 400 }
      );
    }

    const success = await addCustomModel({ providerAlias, id, type, name });
    if (!success) {
      return NextResponse.json(
        { error: "Model already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, model: { providerAlias, id, type, name } });
  } catch (error) {
    console.log("Error creating model:", error);
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}

// PUT /api/models - Update model alias
export async function PUT(request) {
  try {
    const body = await request.json();
    const { model, alias } = body;

    if (!model || !alias) {
      return NextResponse.json({ error: "Model and alias required" }, { status: 400 });
    }

    const modelAliases = await getModelAliases();

    // Check if alias already exists for different model
    const existingModel = Object.entries(modelAliases).find(
      ([key, val]) => val === alias && key !== model
    );

    if (existingModel) {
      return NextResponse.json({ error: "Alias already in use" }, { status: 400 });
    }

    // Update alias
    await setModelAlias(model, alias);

    return NextResponse.json({ success: true, model, alias });
  } catch (error) {
    console.log("Error updating alias:", error);
    return NextResponse.json({ error: "Failed to update alias" }, { status: 500 });
  }
}

// DELETE /api/models?model=xxx - Delete a model
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");

    if (!model) {
      return NextResponse.json({ error: "Model required" }, { status: 400 });
    }

    await deleteModelAlias(model);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting model:", error);
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 });
  }
}
