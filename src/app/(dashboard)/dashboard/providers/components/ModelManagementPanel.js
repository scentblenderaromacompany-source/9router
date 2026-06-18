"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Button, Badge, Modal, Select, Toggle, ConfirmModal } from "@/shared/components";
import { getProvidersByKind } from "@/shared/constants/providers";
import { CAPACITY_META } from "@/shared/constants/models";

export default function ModelManagementPanel() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testingModel, setTestingModel] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [confirmState, setConfirmState] = useState(null);
  const [filterKind, setFilterKind] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const modelKinds = [
    { id: "all", label: "All Kinds" },
    { id: "llm", label: "LLM" },
    { id: "tts", label: "Text-to-Speech" },
    { id: "stt", label: "Speech-to-Text" },
    { id: "embedding", label: "Embedding" },
    { id: "image", label: "Image" },
    { id: "imageToText", label: "Image-to-Text" },
    { id: "video", label: "Video" },
    { id: "music", label: "Music" },
  ];

  const statusOptions = [
    { id: "all", label: "All Status" },
    { id: "available", label: "Available" },
    { id: "disabled", label: "Disabled" },
    { id: "testing", label: "Testing" },
    { id: "error", label: "Error" },
  ];

  const sortOptions = [
    { id: "name", label: "Name" },
    { id: "provider", label: "Provider" },
    { id: "kind", label: "Kind" },
    { id: "status", label: "Status" },
    { id: "updated", label: "Last Updated" },
  ];

  useEffect(() => {
    fetchProviders();
    fetchModelStatus();
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch("/api/providers");
      const data = await response.json();
      if (response.ok) {
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModelStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/models/availability");
      const data = await response.json();
      if (response.ok) {
        setTestResults(data.models || {});
      }
    } catch (error) {
      console.error("Error fetching model status:", error);
    }
  }, []);

  const getFilteredModels = () => {
    let allModels = [];

    providers.forEach(provider => {
      if (provider.models) {
        provider.models.forEach(model => {
          allModels.push({
            ...model,
            providerId: provider.id,
            providerName: provider.name,
            providerColor: provider.color,
          });
        });
      }
    });

    // Apply filters
    let filtered = allModels;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model =>
        model.id.toLowerCase().includes(query) ||
        model.name?.toLowerCase().includes(query) ||
        model.providerName.toLowerCase().includes(query)
      );
    }

    if (filterKind !== "all") {
      filtered = filtered.filter(model => model.kind === filterKind);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(model => {
        const status = testResults[model.id]?.status || "unknown";
        return status === filterStatus;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || a.id).localeCompare(b.name || b.id);
        case "provider":
          return a.providerName.localeCompare(b.providerName);
        case "kind":
          return (a.kind || "").localeCompare(b.kind || "");
        case "status": {
          const statusA = testResults[a.id]?.status || "unknown";
          const statusB = testResults[b.id]?.status || "unknown";
          return statusA.localeCompare(statusB);
        }
        case "updated":
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleSelectModel = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSelectAll = () => {
    const filteredModels = getFilteredModels();
    if (selectedModels.length === filteredModels.length) {
      setSelectedModels([]);
    } else {
      setSelectedModels(filteredModels.map(m => m.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedModels.length === 0) return;

    setConfirmState({
      title: `Perform Bulk Action: ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${selectedModels.length} model(s)?`,
      onConfirm: async () => {
        setConfirmState(null);
        try {
          let endpoint = "";
          let method = "POST";
          let body = {};

          switch (action) {
            case "disable":
              endpoint = "/api/models/disabled";
              body = { ids: selectedModels, action: "disable" };
              break;
            case "enable":
              endpoint = "/api/models/disabled";
              method = "DELETE";
              body = { ids: selectedModels };
              break;
            case "test":
              endpoint = "/api/models/test";
              body = { modelIds: selectedModels };
              break;
            default:
              return;
          }

          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            await fetchModelStatus();
            setSelectedModels([]);
          } else {
            console.error(`Failed to ${action} models`);
          }
        } catch (error) {
          console.error(`Error performing bulk action ${action}:", error);
        }
      }
    });
  };

  const handleTestModel = async (modelId) => {
    setTestingModel(modelId);
    setShowTestModal(true);

    try {
      const response = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelId }),
      });

      const data = await response.json();
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [modelId]: {
            status: data.ok ? "available" : "error",
            error: data.error,
            latency: data.latencyMs,
            testedAt: new Date().toISOString(),
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [modelId]: {
            status: "error",
            error: data.error || "Test failed",
            testedAt: new Date().toISOString(),
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [modelId]: {
          status: "error",
          error: "Network error",
          testedAt: new Date().toISOString(),
        }
      }));
    } finally {
      setTestingModel(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { variant: "success", label: "Available" },
      disabled: { variant: "default", label: "Disabled" },
      testing: { variant: "warning", label: "Testing" },
      error: { variant: "error", label: "Error" },
      unknown: { variant: "default", label: "Unknown" },
    };

    const config = statusConfig[status] || statusConfig.unknown;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getCapabilityBadges = (capabilities) => {
    if (!capabilities) return null;
    return capabilities.slice(0, 3).map(cap => {
      const capMeta = CAPACITY_META[cap];
      if (!capMeta) return null;
      return (
        <Badge key={cap} variant="default" size="xs" className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px]">{capMeta.icon}</span>
          {cap.charAt(0).toUpperCase() + cap.slice(1)}
        </Badge>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredModels = getFilteredModels();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Model Management</h1>
          <p className="text-text-muted">Manage and monitor all AI models across providers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            icon="add"
            onClick={() => setShowAddModelModal(true)}
          >
            Add Model
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="refresh"
            onClick={fetchModelStatus}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <Select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
              options={modelKinds}
              className="w-full sm:w-40"
            />

            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
              className="w-full sm:w-40"
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="w-full sm:w-40"
            />
          </div>

          {selectedModels.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">
                {selectedModels.length} selected
              </span>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-black/[0.02]"
              >
                <span className="material-symbols-outlined text-sm">more_vert</span>
                Bulk Actions
              </button>
            </div>
          )}
        </div>

        {showBulkActions && selectedModels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction("disable")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/40 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/5"
            >
              <span className="material-symbols-outlined text-sm">block</span>
              Disable Selected
            </button>
            <button
              onClick={() => handleBulkAction("enable")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/40 text-xs text-green-600 dark:text-green-400 hover:bg-green-500/5"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Enable Selected
            </button>
            <button
              onClick={() => handleBulkAction("test")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-500/40 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/5"
            >
              <span className="material-symbols-outlined text-sm">science</span>
              Test Selected
            </button>
          </div>
        )}
      </Card>

      {/* Models Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-text-muted">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:text-text-main"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {selectedModels.length === filteredModels.length ? "check_box" : "check_box_outline_blank"}
                    </span>
                    Select
                  </button>
                </th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Model</th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Provider</th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Kind</th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Capabilities</th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Status</th>
                <th className="text-left p-3 text-sm font-medium text-text-muted">Last Tested</th>
                <th className="text-right p-3 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => {
                const status = testResults[model.id]?.status || "unknown";
                const isTesting = testingModel === model.id;

                return (
                  <tr
                    key={model.id}
                    className="border-b border-border hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => handleSelectModel(model.id)}
                        className="text-text-muted hover:text-text-main"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {selectedModels.includes(model.id) ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-text-muted">smart_toy</span>
                        </div>
                        <div>
                          <div className="font-medium">{model.id}</div>
                          {model.name && (
                            <div className="text-xs text-text-muted">{model.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-6 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${model.providerColor}15` }}
                        >
                          <span className="text-xs font-medium" style={{ color: model.providerColor }}>
                            {model.providerName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm">{model.providerName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="default" size="sm">
                        {model.kind?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {getCapabilityBadges(model.capabilities)}
                      </div>
                    </td>
                    <td className="p-3">
                      {isTesting ? (
                        <Badge variant="warning" size="sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                            Testing
                          </span>
                        </Badge>
                      ) : getStatusBadge(status)}
                    </td>
                    <td className="p-3 text-sm text-text-muted">
                      {testResults[model.id]?.testedAt
                        ? new Date(testResults[model.id].testedAt).toLocaleString()
                        : "Never"
                      }
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDetails(true);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-black/[0.02]"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button
                          onClick={() => handleTestModel(model.id)}
                          disabled={isTesting}
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-black/[0.02] disabled:opacity-50"
                          title="Test Model"
                        >
                          <span className="material-symbols-outlined text-sm">science</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowAddModelModal(true);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-black/[0.02]"
                          title="Edit Model"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-muted">
                    No models found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Model Details Modal */}
      <Modal
        isOpen={showModelDetails}
        onClose={() => {
          setShowModelDetails(false);
          setSelectedModel(null);
        }}
        title={selectedModel ? `Model Details: ${selectedModel.id}` : "Model Details"}
      >
        {selectedModel && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-text-muted">smart_toy</span>
              </div>
              <div>
                <h3 className="font-semibold">{selectedModel.id}</h3>
                <p className="text-sm text-text-muted">{selectedModel.providerName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Model ID:</span>
                    <code className="bg-black/[0.03] px-2 py-0.5 rounded text-xs">{selectedModel.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Name:</span>
                    <span>{selectedModel.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Kind:</span>
                    <Badge variant="default" size="sm">{selectedModel.kind?.toUpperCase() || "UNKNOWN"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Free Model:</span>
                    <Badge variant={selectedModel.isFree ? "success" : "default"} size="sm">
                      {selectedModel.isFree ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-1">
                  {getCapabilityBadges(selectedModel.capabilities)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              {testResults[selectedModel.id] ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status:</span>
                    {getStatusBadge(testResults[selectedModel.id].status)}
                  </div>
                  {testResults[selectedModel.id].error && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Error:</span>
                      <span className="text-red-500 text-xs">{testResults[selectedModel.id].error}</span>
                    </div>
                  )}
                  {testResults[selectedModel.id].latency && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Latency:</span>
                      <span>{testResults[selectedModel.id].latency}ms</span>
                    </div>
                  )}
                  {testResults[selectedModel.id].testedAt && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Last Tested:</span>
                      <span>{new Date(testResults[selectedModel.id].testedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-muted">Status unknown. Click "Test Model" to check.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                icon="science"
                onClick={() => handleTestModel(selectedModel.id)}
                disabled={testingModel === selectedModel.id}
              >
                {testingModel === selectedModel.id ? "Testing..." : "Test Model"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon="edit"
                onClick={() => {
                  setShowModelDetails(false);
                  setShowAddModelModal(true);
                }}
              >
                Edit Model
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Model Modal */}
      <Modal
        isOpen={showAddModelModal}
        onClose={() => {
          setShowAddModelModal(false);
          setSelectedModel(null);
        }}
        title={selectedModel ? "Edit Model" : "Add New Model"}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Model ID</label>
            <input
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              defaultValue={selectedModel?.id}
              placeholder="e.g. gpt-4-turbo"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Model Name</label>
            <input
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              defaultValue={selectedModel?.name}
              placeholder="e.g. GPT-4 Turbo"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Provider</label>
            <select
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              defaultValue={selectedModel?.providerId}
            >
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Kind</label>
            <select
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              defaultValue={selectedModel?.kind}
            >
              {modelKinds.filter(k => k.id !== "all").map(kind => (
                <option key={kind.id} value={kind.id}>{kind.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CAPACITY_META).map(([cap, meta]) => (
                <label key={cap} className="flex items-center gap-1 text-xs">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="material-symbols-outlined text-sm" style={{ color: meta.color }}>{meta.icon}</span>
                  {cap.charAt(0).toUpperCase() + cap.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="free-model" className="rounded border-border" />
            <label htmlFor="free-model" className="text-xs text-text-muted">Free Model</label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" fullWidth>Save</Button>
            <Button size="sm" variant="ghost" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Test Results Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestingModel(null);
        }}
        title="Model Test Results"
      >
        {testingModel && testResults[testingModel] && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-text-muted">smart_toy</span>
              </div>
              <div>
                <h3 className="font-medium">{testingModel}</h3>
                <p className="text-xs text-text-muted">Tested at {new Date(testResults[testingModel].testedAt).toLocaleString()}</p>
              </div>
              <div className="ml-auto">
                {getStatusBadge(testResults[testingModel].status)}
              </div>
            </div>

            <div className="space-y-3">
              {testResults[testingModel].latency && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02]">
                  <span className="text-sm text-text-muted">Latency:</span>
                  <span className="font-mono text-sm">{testResults[testingModel].latency}ms</span>
                </div>
              )}

              {testResults[testingModel].error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="text-sm text-text-muted mb-1">Error:</div>
                  <div className="text-sm text-red-600 dark:text-red-400">{testResults[testingModel].error}</div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="text-sm text-text-muted mb-1">Test Result:</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {testResults[testingModel].status === "available" ? "Model is responding normally" : "Model has issues"}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
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