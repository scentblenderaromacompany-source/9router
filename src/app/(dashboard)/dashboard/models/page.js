"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Modal from "@/shared/components/Modal";
import Toggle from "@/shared/components/Toggle";
import { ConfirmModal, CardSkeleton } from "@/shared/components";
import CapacityBadges from "@/shared/components/CapacityBadges";
import ModelSelectModal from "@/shared/components/ModelSelectModal";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "60d", label: "60D" },
];

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [customModels, setCustomModels] = useState([]);
  const [aliases, setAliases] = useState({});
  const [disabled, setDisabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [activeProviders, setActiveProviders] = useState([]);
  const [modelCaps, setModelCaps] = useState({});
  const [selectedModels, setSelectedModels] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkProvider, setBulkProvider] = useState("");
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        modelsRes,
        providersRes,
        settingsRes,
        aliasesRes,
        disabledRes,
      ] = await Promise.all([
        fetch("/api/models"),
        fetch("/api/providers"),
        fetch("/api/settings"),
        fetch("/api/models/alias"),
        fetch("/api/models/availability"),
      ]);

      const modelsData = await modelsRes.json();
      const providersData = await providersRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};
      const aliasesData = aliasesRes.ok ? await aliasesRes.json() : { aliases: {} };
      const disabledData = disabledRes.ok ? await disabledRes.json() : {};

      if (modelsRes.ok) {
        setModels(modelsData.models || []);
        setCustomModels(modelsData.customModels || []);
        setAliases(modelsData.aliases || {});
        setDisabled(modelsData.disabled || {});

        // Build fullModel -> caps map for badge lookup
        const map = {};
        for (const m of modelsData.models || []) if (m.caps) map[m.fullModel] = m.caps;
        setModelCaps(map);
      }

      if (providersRes.ok) {
        setActiveProviders(providersData.connections || []);
      }

    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        setShowCreateModal(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create model");
      }
    } catch (error) {
      console.log("Error creating model:", error);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`/api/models`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        setEditingModel(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update model");
      }
    } catch (error) {
      console.log("Error updating model:", error);
    }
  };

  const handleDelete = async (model) => {
    setConfirmState({
      title: "Delete Model",
      message: `Delete model alias "${model}" and all associated data? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState(null);
        try {
          const res = await fetch(`/api/models?model=${encodeURIComponent(model)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setModels(models.filter((m) => m.fullModel !== model));
            setAliases((prev) => {
              const newAliases = { ...prev };
              delete newAliases[model];
              return newAliases;
            });
          }
        } catch (error) {
          console.log("Error deleting model:", error);
        }
      },
    });
  };

  const handleBulkOperation = async () => {
    if (!bulkAction || !bulkProvider || selectedModels.length === 0) return;

    setConfirmState({
      title: "Confirm Bulk Operation",
      message: `Perform ${bulkAction} operation on ${selectedModels.length} model(s) for provider "${bulkProvider}"?`,
      onConfirm: async () => {
        setConfirmState(null);
        try {
          const res = await fetch("/api/models/bulk-operations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: bulkAction,
              provider: bulkProvider,
              models: selectedModels,
            }),
          });
          if (res.ok) {
            await fetchData();
            setShowBulkModal(false);
            setSelectedModels([]);
            setBulkAction("");
            setBulkProvider("");
          } else {
            const err = await res.json();
            alert(err.error || "Failed to perform bulk operation");
          }
        } catch (error) {
          console.log("Error performing bulk operation:", error);
        }
      },
    });
  };

  const toggleModelSelection = (fullModel) => {
    setSelectedModels((prev) =>
      prev.includes(fullModel)
        ? prev.filter((m) => m !== fullModel)
        : [...prev, fullModel]
    );
  };

  const selectAllModels = () => {
    setSelectedModels(models.map((m) => m.fullModel));
  };

  const clearSelection = () => {
    setSelectedModels([]);
  };

  const getProviderModels = (provider) => {
    return models.filter((m) => m.provider === provider);
  };

  const getUniqueProviders = () => {
    return [...new Set(models.map((m) => m.provider))];
  };

  const getDisabledCount = (provider) => {
    return disabled[provider]?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Model Management</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage all AI models across providers - add, edit, delete, and monitor usage
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            icon="analytics"
            onClick={() => setShowAnalyticsModal(true)}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            View Analytics
          </Button>
          <Button
            icon="add"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            Add Custom Model
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-text-muted text-sm uppercase font-semibold">
            Total Models
          </div>
          <div className="text-2xl font-bold mt-1">
            {models.length + customModels.length}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {models.length} built-in + {customModels.length} custom
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-text-muted text-sm uppercase font-semibold">
            Providers
          </div>
          <div className="text-2xl font-bold mt-1">
            {getUniqueProviders().length}
          </div>
          <div className="text-xs text-text-muted mt-1">
            Active providers
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-text-muted text-sm uppercase font-semibold">
            Aliases
          </div>
          <div className="text-2xl font-bold mt-1">
            {Object.keys(aliases).length}
          </div>
          <div className="text-xs text-text-muted mt-1">
            Custom aliases
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-text-muted text-sm uppercase font-semibold">
            Disabled
          </div>
          <div className="text-2xl font-bold mt-1 text-warning">
            {Object.values(disabled).reduce((sum, arr) => sum + arr.length, 0)}
          </div>
          <div className="text-xs text-text-muted mt-1">
            Temporarily disabled
          </div>
        </Card>
      </div>

      {/* Bulk Operations */}
      {selectedModels.length > 0 && (
        <Card className="p-4 bg-primary/5 border border-primary/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="font-medium">{selectedModels.length}</span> model(s) selected
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                <option value="">Select action...</option>
                <option value="disable">Disable Models</option>
                <option value="enable">Enable Models</option>
                <option value="clearCooldown">Clear Cooldown</option>
              </select>
              <select
                value={bulkProvider}
                onChange={(e) => setBulkProvider(e.target.value)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                <option value="">Select provider...</option>
                {getUniqueProviders().map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => setShowBulkModal(true)}
                disabled={!bulkAction || !bulkProvider}
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={clearSelection}
                variant="ghost"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Models List */}
      {models.length === 0 && customModels.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <span className="material-symbols-outlined text-[32px]">model_training</span>
            </div>
            <p className="text-text-main font-medium mb-1">No models configured</p>
            <p className="text-sm text-text-muted mb-4">Add custom models to get started</p>
            <Button icon="add" onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
              Add Custom Model
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Built-in Models */}
          {models.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Built-in Models</h2>
              <div className="flex flex-col gap-3">
                {models.map((model) => (
                  <ModelCard
                    key={model.fullModel}
                    model={model}
                    modelCaps={modelCaps}
                    copied={copied}
                    onCopy={copy}
                    onEdit={() => setEditingModel(model)}
                    onDelete={() => handleDelete(model.fullModel)}
                    onToggleDisable={(disabled) => {
                      if (disabled) {
                        // Disable model
                      } else {
                        // Enable model
                      }
                    }}
                    isSelected={selectedModels.includes(model.fullModel)}
                    onSelect={() => toggleModelSelection(model.fullModel)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Models */}
          {customModels.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Custom Models</h2>
              <div className="flex flex-col gap-3">
                {customModels.map((model) => (
                  <CustomModelCard
                    key={`${model.providerAlias}|${model.id}|${model.type}`}
                    model={model}
                    onEdit={() => setEditingModel(model)}
                    onDelete={() => handleDelete(`${model.providerAlias}/${model.id}`)}
                    isSelected={selectedModels.includes(`${model.providerAlias}/${model.id}`)}
                    onSelect={() => toggleModelSelection(`${model.providerAlias}/${model.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modals */}
      <ModelCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        activeProviders={activeProviders}
      />

      <ModelEditModal
        isOpen={!!editingModel}
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onSave={handleUpdate}
        activeProviders={activeProviders}
      />

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedModels={selectedModels}
        providers={getUniqueProviders()}
        onConfirm={handleBulkOperation}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm}
        title={confirmState?.title || "Confirm"}
        message={confirmState?.message}
        variant="danger"
      />
    </div>
  );
}

function ModelCard({ model, modelCaps = {}, copied, onCopy, onEdit, onDelete, onToggleDisable, isSelected, onSelect }) {
  return (
    <Card padding="sm" className="group">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 shrink-0"
          />
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">model_training</span>
          </div>
          <div className="min-w-0 flex-1">
            <code className="block truncate font-mono text-sm font-medium">
              {model.fullModel}
            </code>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
              <span className="text-xs text-text-muted">Provider: {model.provider}</span>
              <span className="text-xs text-text-muted">Model: {model.model}</span>
              {model.alias && model.alias !== model.model && (
                <span className="text-xs text-success">Alias: {model.alias}</span>
              )}
              <CapacityBadges caps={modelCaps[model.fullModel]} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(model.fullModel, `model-${model.fullModel}`); }}
            className="flex flex-col items-center rounded px-2 py-1 text-text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
            title="Copy model name"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied === `model-${model.fullModel}` ? "check" : "content_copy"}
            </span>
            <span className="text-[10px] leading-tight">Copy</span>
          </button>
          <button
            onClick={onEdit}
            className="flex flex-col items-center rounded px-2 py-1 text-text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="text-[10px] leading-tight">Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex flex-col items-center rounded px-2 py-1 text-red-500 transition-colors hover:bg-red-500/10"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span className="text-[10px] leading-tight">Delete</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

function CustomModelCard({ model, onEdit, onDelete, isSelected, onSelect }) {
  return (
    <Card padding="sm" className="group border-dashed border-2 border-primary/30 bg-primary/5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 shrink-0"
          />
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
          </div>
          <div className="min-w-0 flex-1">
            <code className="block truncate font-mono text-sm font-medium">
              {model.providerAlias}/{model.id}
            </code>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
              <span className="text-xs text-text-muted">Type: {model.type}</span>
              <span className="text-xs text-text-muted">Name: {model.name}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:shrink-0">
          <button
            onClick={onEdit}
            className="flex flex-col items-center rounded px-2 py-1 text-text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="text-[10px] leading-tight">Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex flex-col items-center rounded px-2 py-1 text-red-500 transition-colors hover:bg-red-500/10"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span className="text-[10px] leading-tight">Delete</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

function ModelCreateModal({ isOpen, onClose, onSave, activeProviders }) {
  const [providerAlias, setProviderAlias] = useState("");
  const [id, setId] = useState("");
  const [type, setType] = useState("llm");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!providerAlias || !id) return;

    setSaving(true);
    await onSave({
      providerAlias,
      id,
      type,
      name: name || id,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Model"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Provider Alias</label>
          <select
            value={providerAlias}
            onChange={(e) => setProviderAlias(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select provider...</option>
            {activeProviders.map((provider) => (
              <option key={provider.provider} value={provider.provider}>
                {provider.provider}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Model ID</label>
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="model-name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="llm">LLM</option>
            <option value="vision">Vision</option>
            <option value="search">Search</option>
            <option value="reasoning">Reasoning</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Display Name (optional)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom display name"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button onClick={onClose} variant="ghost" fullWidth size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            fullWidth
            size="sm"
            disabled={!providerAlias || !id || saving}
          >
            {saving ? "Creating..." : "Create Model"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ModelEditModal({ isOpen, model, onClose, onSave, activeProviders }) {
  const [providerAlias, setProviderAlias] = useState(model?.providerAlias || "");
  const [id, setId] = useState(model?.id || "");
  const [type, setType] = useState(model?.type || "llm");
  const [name, setName] = useState(model?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (model) {
      setProviderAlias(model.providerAlias || "");
      setId(model.id || "");
      setType(model.type || "llm");
      setName(model.name || "");
    }
  }, [model]);

  const handleSave = async () => {
    if (!providerAlias || !id) return;

    setSaving(true);
    await onSave(model?.fullModel || `${providerAlias}/${id}`, {
      providerAlias,
      id,
      type,
      name: name || id,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Model"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Provider Alias</label>
          <select
            value={providerAlias}
            onChange={(e) => setProviderAlias(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={true} // Provider alias cannot be changed
          >
            <option value={providerAlias}>{providerAlias}</option>
          </select>
          <p className="text-xs text-text-muted mt-1">Provider alias cannot be changed</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Model ID</label>
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="model-name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="llm">LLM</option>
            <option value="vision">Vision</option>
            <option value="search">Search</option>
            <option value="reasoning">Reasoning</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Display Name (optional)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom display name"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button onClick={onClose} variant="ghost" fullWidth size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            fullWidth
            size="sm"
            disabled={!providerAlias || !id || saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function BulkOperationsModal({ isOpen, onClose, selectedModels, providers, onConfirm }) {
  const [bulkAction, setBulkAction] = useState("");
  const [bulkProvider, setBulkProvider] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!bulkAction || !bulkProvider) return;

    setSaving(true);
    await onConfirm();
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Operations"
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm text-text-muted">
          Performing operation on {selectedModels.length} model(s)
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Action</label>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select action...</option>
            <option value="disable">Disable Models</option>
            <option value="enable">Enable Models</option>
            <option value="clearCooldown">Clear Cooldown</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Provider</label>
          <select
            value={bulkProvider}
            onChange={(e) => setBulkProvider(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select provider...</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button onClick={onClose} variant="ghost" fullWidth size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            fullWidth
            size="sm"
            disabled={!bulkAction || !bulkProvider || saving}
          >
            {saving ? "Performing..." : "Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AnalyticsModal({ isOpen, onClose }) {
  const [period, setPeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/models/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, period]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Model Analytics"
      size="large"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-muted mt-2">Loading analytics...</p>
          </div>
        ) : analyticsData ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-text-muted text-sm uppercase font-semibold">
                  Total Requests
                </div>
                <div className="text-2xl font-bold mt-1">
                  {analyticsData.totalRequests.toLocaleString()}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-text-muted text-sm uppercase font-semibold">
                  Total Tokens
                </div>
                <div className="text-2xl font-bold mt-1">
                  {analyticsData.totalTokens.toLocaleString()}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-text-muted text-sm uppercase font-semibold">
                  Total Cost
                </div>
                <div className="text-2xl font-bold mt-1">
                  ${analyticsData.totalCost.toFixed(4)}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Model Usage Breakdown</h3>
              <div className="space-y-3">
                {analyticsData.stats.map((stat) => (
                  <div key={`${stat.provider}-${stat.model}`} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <code className="font-mono text-sm">{stat.provider}/{stat.model}</code>
                      <div className="text-xs text-text-muted mt-0.5">
                        {stat.requests} requests • {stat.inputTokens.toLocaleString()} input • {stat.outputTokens.toLocaleString()} output
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${stat.cost.toFixed(4)}</div>
                      <div className="text-xs text-text-muted">
                        {stat.inputTokens + stat.outputTokens > 0
                          ? `$${((stat.cost / (stat.inputTokens + stat.outputTokens)) * 1000000).toFixed(2)} per 1M tokens`
                          : "N/A"
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            No analytics data available
          </div>
        )}
      </div>
    </Modal>
  );
}
