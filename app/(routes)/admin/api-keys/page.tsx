"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  scopes: string[];
  requestsPerHour: number;
  requestsPerDay: number;
  ipWhitelist?: string;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
        fetchApiKeys();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `API key ${!currentStatus ? "activated" : "deactivated"}`,
        });
        fetchApiKeys();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const maskKey = (key: string) => {
    const prefix = key.substring(0, 15);
    return `${prefix}${"•".repeat(20)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            API Keys
          </h1>
          <p className="text-muted-foreground">
            Manage API keys for external application access
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create API Key
        </Button>
      </div>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12 glass-effect rounded-lg">
            <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API key to start integrating external applications
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="glass-effect rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apiKey.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {apiKey.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {apiKey.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {apiKey.description}
                    </p>
                  )}

                  {/* API Key Display */}
                  <div className="flex items-center gap-2 mb-3 font-mono text-sm bg-black/20 p-3 rounded">
                    <code className="flex-1">
                      {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleReveal(apiKey.id)}
                      className="hover:text-primary transition-colors"
                      aria-label={revealedKeys.has(apiKey.id) ? "Hide API key" : "Reveal API key"}
                    >
                      {revealedKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="hover:text-primary transition-colors"
                      aria-label="Copy API key to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Scopes</div>
                      <div className="font-medium">
                        {apiKey.scopes.length} permission{apiKey.scopes.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rate Limit</div>
                      <div className="font-medium">
                        {apiKey.requestsPerHour}/hour
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Used</div>
                      <div className="font-medium">
                        {apiKey.lastUsedAt
                          ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Expires</div>
                      <div className="font-medium">
                        {apiKey.expiresAt
                          ? new Date(apiKey.expiresAt).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(apiKey.id, apiKey.isActive)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateApiKeyDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchApiKeys();
          }}
        />
      )}
    </div>
  );
}

// Separate component for the create dialog
function CreateApiKeyDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopes, setScopes] = useState<string[]>(["tools:read", "courses:read"]);
  const [requestsPerHour, setRequestsPerHour] = useState(1000);
  const [requestsPerDay, setRequestsPerDay] = useState(10000);
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdKey, setCreatedKey] = useState<{
    apiKey: string;
    secretKey: string;
  } | null>(null);
  const { toast } = useToast();

  const availableScopes = [
    { value: "tools:read", label: "Tools: Read" },
    { value: "tools:write", label: "Tools: Write" },
    { value: "courses:read", label: "Courses: Read" },
    { value: "courses:write", label: "Courses: Write" },
    { value: "resources:read", label: "Resources: Read" },
    { value: "blog:read", label: "Blog: Read" },
    { value: "search:read", label: "Search: Read" },
  ];

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const expiresAt =
        expiresInDays !== ""
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          scopes,
          requestsPerHour,
          requestsPerDay,
          expiresAt,
          ipWhitelist: ipWhitelist.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKey({
          apiKey: data.apiKey,
          secretKey: data.secretKey,
        });
        toast({
          title: "Success",
          description: "API key created successfully",
        });
      } else {
        throw new Error("Failed to create");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (createdKey) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-effect rounded-lg max-w-2xl w-full p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-green-400">API Key Created!</h2>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-400 font-medium">
              ⚠️ Save these credentials now! The secret key will not be shown again.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">API Key</label>
              <div className="flex items-center gap-2 font-mono text-sm bg-black/20 p-3 rounded">
                <code className="flex-1 break-all">{createdKey.apiKey}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey.apiKey);
                    toast({ title: "Copied API key!" });
                  }}
                  className="hover:text-primary transition-colors"
                  aria-label="Copy API key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Secret Key</label>
              <div className="flex items-center gap-2 font-mono text-sm bg-black/20 p-3 rounded">
                <code className="flex-1 break-all">{createdKey.secretKey}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey.secretKey);
                    toast({ title: "Copied secret key!" });
                  }}
                  className="hover:text-primary transition-colors"
                  aria-label="Copy secret key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <Button onClick={onSuccess} className="w-full mt-4">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Create API Key</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Production API Key"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Used for production application..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {availableScopes.map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope.value)}
                    onChange={() => toggleScope(scope.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{scope.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="requestsPerHour" className="text-sm font-medium mb-1 block">Requests/Hour</label>
              <input
                id="requestsPerHour"
                type="number"
                value={requestsPerHour}
                onChange={(e) => setRequestsPerHour(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="requestsPerDay" className="text-sm font-medium mb-1 block">Requests/Day</label>
              <input
                id="requestsPerDay"
                type="number"
                value={requestsPerDay}
                onChange={(e) => setRequestsPerDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Expires In (days, leave empty for no expiration)
            </label>
            <input
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="90"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              IP Whitelist (comma-separated, leave empty for all IPs)
            </label>
            <input
              type="text"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="192.168.1.1, 10.0.0.1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Creating..." : "Create API Key"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
