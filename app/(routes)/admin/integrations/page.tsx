"use client";

import { useEffect, useState } from "react";
import { 
  Puzzle, 
  Plus, 
  Settings2, 
  Trash2, 
  Twitter,
  Facebook,
  Linkedin,
  Slack,
  Webhook,
  Database,
  Search,
  Loader2,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  image: string;
  isConnected: boolean;
  config: string;
  updatedAt: string;
}

interface Preset {
  name: string;
  provider: string;
  category: string;
  description: string;
  image: string;
  fields: ProviderField[];
}

interface ProviderField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  placeholder: string;
  required: boolean;
}

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  twitter: [
    { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Twitter API Key", required: true },
    { key: "api_secret", label: "API Secret", type: "password", placeholder: "Enter your Twitter API Secret", required: true },
    { key: "access_token", label: "Access Token", type: "password", placeholder: "Enter your Access Token", required: true },
    { key: "access_token_secret", label: "Access Token Secret", type: "password", placeholder: "Enter your Access Token Secret", required: true },
  ],
  linkedin: [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Enter your LinkedIn Client ID", required: true },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Enter your LinkedIn Client Secret", required: true },
    { key: "redirect_uri", label: "Redirect URI", type: "url", placeholder: "https://yourdomain.com/auth/linkedin/callback", required: false },
  ],
  facebook: [
    { key: "app_id", label: "App ID", type: "text", placeholder: "Enter your Facebook App ID", required: true },
    { key: "app_secret", label: "App Secret", type: "password", placeholder: "Enter your Facebook App Secret", required: true },
    { key: "page_access_token", label: "Page Access Token", type: "password", placeholder: "Enter your Page Access Token", required: true },
  ],
  slack: [
    { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/...", required: true },
    { key: "channel", label: "Default Channel", type: "text", placeholder: "#general", required: false },
  ],
  zapier: [
    { key: "webhook_url", label: "Zapier Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/hooks/catch/...", required: true },
  ],
  salesforce: [
    { key: "client_id", label: "Consumer Key", type: "text", placeholder: "Enter your Salesforce Consumer Key", required: true },
    { key: "client_secret", label: "Consumer Secret", type: "password", placeholder: "Enter your Salesforce Consumer Secret", required: true },
    { key: "instance_url", label: "Instance URL", type: "url", placeholder: "https://yourorg.salesforce.com", required: true },
    { key: "username", label: "Username", type: "text", placeholder: "user@example.com", required: false },
  ],
  custom_webhook: [
    { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://your-service.com/webhook", required: true },
    { key: "auth_header", label: "Authorization Header", type: "password", placeholder: "Bearer your-token", required: false },
    { key: "content_type", label: "Content Type", type: "text", placeholder: "application/json", required: false },
  ],
};

const PRESETS: Preset[] = [
  {
    name: "Twitter",
    provider: "twitter",
    category: "social",
    description: "Connect to Twitter API to auto-post content.",
    image: "/icons/twitter.svg",
    fields: PROVIDER_FIELDS.twitter,
  },
  {
    name: "LinkedIn",
    provider: "linkedin",
    category: "social",
    description: "Share posts directly to your LinkedIn company page.",
    image: "/icons/linkedin.svg",
    fields: PROVIDER_FIELDS.linkedin,
  },
  {
    name: "Facebook",
    provider: "facebook",
    category: "social",
    description: "Integration with Facebook Graph API.",
    image: "/icons/facebook.svg",
    fields: PROVIDER_FIELDS.facebook,
  },
  {
    name: "Zapier",
    provider: "zapier",
    category: "automation",
    description: "Trigger zaps on new posts or user signups.",
    image: "/icons/zapier.svg",
    fields: PROVIDER_FIELDS.zapier,
  },
  {
    name: "Slack",
    provider: "slack",
    category: "automation",
    description: "Send notifications to a Slack channel.",
    image: "/icons/slack.svg",
    fields: PROVIDER_FIELDS.slack,
  },
  {
    name: "Salesforce",
    provider: "salesforce",
    category: "erp",
    description: "Sync leads and contacts with Salesforce CRM.",
    image: "/icons/salesforce.svg",
    fields: PROVIDER_FIELDS.salesforce,
  },
  {
    name: "Custom Webhook",
    provider: "custom_webhook",
    category: "custom",
    description: "Send JSON payloads to any custom URL.",
    image: "/icons/webhook.svg",
    fields: PROVIDER_FIELDS.custom_webhook,
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "social" | "automation" | "erp" | "custom">("all");
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    config: Record<string, string>;
  }>({
    name: "",
    config: {}
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/admin/integrations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setIntegrations(data);
    } catch {
      toast.error("Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", config: {} });
    setSelectedPreset(null);
    setEditingIntegration(null);
    setShowSecrets({});
  };

  const handleCreate = async () => {
    try {
      if (!selectedPreset) return;
      setIsSaving(true);
      
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedPreset,
          name: formData.name || selectedPreset.name,
          config: JSON.stringify(formData.config)
        })
      });
      
      if (!res.ok) throw new Error("Failed to create");
      
      toast.success("Integration created successfully");
      setMode("list");
      resetForm();
      fetchIntegrations();
    } catch {
      toast.error("Failed to create integration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingIntegration) return;
      setIsSaving(true);
      
      const res = await fetch(`/api/admin/integrations/${editingIntegration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          config: JSON.stringify(formData.config),
          description: editingIntegration.description
        })
      });
      
      if (!res.ok) throw new Error("Failed to update");
      
      toast.success("Integration updated successfully");
      setMode("list");
      resetForm();
      fetchIntegrations();
    } catch {
      toast.error("Failed to update integration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const integrationId = editingIntegration?.id;
    if (!integrationId) {
      // For new integrations, we need to save first
      toast.info("Please save the integration first before testing the connection.");
      return;
    }

    setIsTesting(true);
    try {
      // First, save the current config
      await fetch(`/api/admin/integrations/${integrationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          config: JSON.stringify(formData.config),
        })
      });

      // Then test the connection
      const res = await fetch(`/api/admin/integrations/${integrationId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchIntegrations();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this integration?")) return;
    try {
      const res = await fetch(`/api/admin/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Integration removed");
      fetchIntegrations();
    } catch {
      toast.error("Failed to remove integration");
    }
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    const preset = PRESETS.find(p => p.provider === integration.provider);
    setSelectedPreset(preset || null);
    
    let config: Record<string, string> = {};
    try {
      config = JSON.parse(integration.config || "{}");
    } catch {
      config = {};
    }
    
    setFormData({
      name: integration.name,
      config
    });
    setMode("edit");
  };

  const getIcon = (provider: string) => {
    switch(provider) {
      case "twitter": return <Twitter className="w-6 h-6" />;
      case "facebook": return <Facebook className="w-6 h-6" />;
      case "linkedin": return <Linkedin className="w-6 h-6" />;
      case "slack": return <Slack className="w-6 h-6" />;
      case "zapier": return <Zap className="w-6 h-6" />;
      case "custom_webhook": return <Webhook className="w-6 h-6" />;
      case "salesforce": return <Database className="w-6 h-6" />;
      default: return <Puzzle className="w-6 h-6" />;
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || i.category === activeTab;
    return matchesSearch && matchesTab;
  });

  // Render the configuration form
  const renderConfigForm = () => {
    const fields = selectedPreset?.fields || PROVIDER_FIELDS[editingIntegration?.provider || ""] || [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => { setMode("list"); resetForm(); }} 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Integrations
          </button>
          <h1 className="text-2xl font-bold">
            {mode === "new" ? "Add New Integration" : "Edit Integration"}
          </h1>
        </div>

        {mode === "new" && !selectedPreset ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.provider}
                onClick={() => {
                  setSelectedPreset(preset);
                  setFormData({ name: preset.name, config: {} });
                }}
                className="glass-card p-6 text-left hover:bg-white/5 transition-colors flex flex-col gap-4 group"
              >
                <div className="p-3 rounded-lg bg-secondary/50 w-fit group-hover:bg-primary/20 transition-colors">
                  {getIcon(preset.provider)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/20">
                {getIcon(selectedPreset?.provider || editingIntegration?.provider || "")}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  Configure {selectedPreset?.name || editingIntegration?.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selectedPreset?.description || editingIntegration?.description}
                </p>
              </div>
              {editingIntegration && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  editingIntegration.isConnected 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {editingIntegration.isConnected ? "Connected" : "Not Connected"}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Integration Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-white/10 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. My Twitter Bot"
                />
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">
                  API Credentials
                </h3>
                
                {fields.map((field) => (
                  <div key={field.key} className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type={field.type === "password" && !showSecrets[field.key] ? "password" : "text"}
                        value={formData.config[field.key] || ""}
                        onChange={(e) => setFormData({
                          ...formData, 
                          config: { ...formData.config, [field.key]: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 rounded-lg bg-secondary/30 border border-white/10 focus:border-primary outline-none transition-colors pr-12"
                        placeholder={field.placeholder}
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-white/10">
              <div>
                {mode === "edit" && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  type="button" 
                  onClick={() => { setMode("list"); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={mode === "new" ? handleCreate : handleUpdate}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    mode === "new" ? "Create Integration" : "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the list view
  if (mode === "new" || mode === "edit") {
    return renderConfigForm();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and automate workflows.
          </p>
        </div>
        <Button onClick={() => setMode("new")} className="gap-2">
          <Plus className="w-4 h-4" /> Add Integration
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 p-1 rounded-lg bg-secondary/30 border border-white/10">
          {(["all", "social", "automation", "erp", "custom"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             type="text" 
             placeholder="Search integrations..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary/30 border border-white/10 focus:border-primary outline-none text-sm"
           />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="glass-card p-6 flex flex-col justify-between group">
               <div>
                 <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                       {getIcon(integration.provider)}
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      integration.isConnected 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                       {integration.isConnected ? (
                         <>
                           <CheckCircle2 className="w-3 h-3" />
                           Active
                         </>
                       ) : (
                         <>
                           <XCircle className="w-3 h-3" />
                           Inactive
                         </>
                       )}
                    </div>
                 </div>
                 <h3 className="font-semibold text-lg mb-1">{integration.name}</h3>
                 <p className="text-sm text-muted-foreground line-clamp-2">{integration.description}</p>
               </div>
               
               <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                 <span className="text-xs text-muted-foreground capitalize">{integration.category}</span>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(integration.id)}
                      className="p-2 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(integration)}
                      className="p-2 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      title="Configure"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>
          ))}
          
          {filteredIntegrations.length === 0 && (
             <div className="col-span-full py-12 text-center text-muted-foreground">
               No integrations found matching your criteria.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
