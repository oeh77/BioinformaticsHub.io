"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  Loader2, 
  DollarSign, 
  Code2, 
  Tag, 
  LayoutList,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2
} from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  slotId: string;
  format: string;
  position: string;
  enabled: boolean;
}

interface MetaTag {
  id: string;
  name: string;
  content: string;
}

interface AdSenseSettings {
  // Core settings
  adsenseEnabled: boolean;
  publisherId: string;
  autoAdsEnabled: boolean;
  
  // Meta tags
  metaTags: MetaTag[];
  
  // Ad slots
  adSlots: AdSlot[];
  
  // Custom code snippets
  headCodeSnippet: string;
  bodyCodeSnippet: string;
  
  // Consent settings
  requireConsent: boolean;
  consentMessage: string;
  
  // Debug mode
  debugMode: boolean;
}

const defaultSettings: AdSenseSettings = {
  adsenseEnabled: true,
  publisherId: "ca-pub-3962865099022579",
  autoAdsEnabled: false,
  metaTags: [
    {
      id: "1",
      name: "google-adsense-account",
      content: "ca-pub-3962865099022579"
    }
  ],
  adSlots: [
    {
      id: "1",
      name: "Footer Ad",
      slotId: "",
      format: "auto",
      position: "footer",
      enabled: true
    },
    {
      id: "2",
      name: "In-Content Ad",
      slotId: "",
      format: "auto",
      position: "inContent",
      enabled: true
    },
    {
      id: "3",
      name: "Sidebar Ad",
      slotId: "",
      format: "vertical",
      position: "sidebar",
      enabled: false
    }
  ],
  headCodeSnippet: "",
  bodyCodeSnippet: "",
  requireConsent: true,
  consentMessage: "We use cookies to personalize ads and analyze traffic. Do you consent to the use of cookies?",
  debugMode: false
};

export default function AdminAdSensePage() {
  const [settings, setSettings] = useState<AdSenseSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPublisherId, setShowPublisherId] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "slots" | "code" | "meta">("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/adsense");
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch AdSense settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/adsense", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "AdSense settings saved successfully! Changes will apply on next deployment." });
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addMetaTag = () => {
    setSettings(prev => ({
      ...prev,
      metaTags: [
        ...prev.metaTags,
        { id: Date.now().toString(), name: "", content: "" }
      ]
    }));
  };

  const removeMetaTag = (id: string) => {
    setSettings(prev => ({
      ...prev,
      metaTags: prev.metaTags.filter(tag => tag.id !== id)
    }));
  };

  const updateMetaTag = (id: string, field: "name" | "content", value: string) => {
    setSettings(prev => ({
      ...prev,
      metaTags: prev.metaTags.map(tag =>
        tag.id === id ? { ...tag, [field]: value } : tag
      )
    }));
  };

  const addAdSlot = () => {
    setSettings(prev => ({
      ...prev,
      adSlots: [
        ...prev.adSlots,
        {
          id: Date.now().toString(),
          name: "New Ad Slot",
          slotId: "",
          format: "auto",
          position: "custom",
          enabled: false
        }
      ]
    }));
  };

  const removeAdSlot = (id: string) => {
    setSettings(prev => ({
      ...prev,
      adSlots: prev.adSlots.filter(slot => slot.id !== id)
    }));
  };

  const updateAdSlot = (id: string, field: keyof AdSlot, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      adSlots: prev.adSlots.map(slot =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: DollarSign },
    { id: "slots", label: "Ad Slots", icon: LayoutList },
    { id: "meta", label: "Meta Tags", icon: Tag },
    { id: "code", label: "Code Snippets", icon: Code2 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            AdSense Configuration
          </h1>
          <p className="text-muted-foreground mt-1">Manage Google AdSense integration and ad placements</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full">
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-green-500/10 border border-green-500/30 text-green-500" 
            : "bg-red-500/10 border border-red-500/30 text-red-500"
        }`}>
          {message.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`glass-card p-4 border-l-4 ${settings.adsenseEnabled ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <p className="text-sm text-muted-foreground">AdSense Status</p>
          <p className={`font-semibold ${settings.adsenseEnabled ? 'text-green-500' : 'text-red-500'}`}>
            {settings.adsenseEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-muted-foreground">Active Slots</p>
          <p className="font-semibold text-blue-500">
            {settings.adSlots.filter(s => s.enabled).length} / {settings.adSlots.length}
          </p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-purple-500">
          <p className="text-sm text-muted-foreground">Meta Tags</p>
          <p className="font-semibold text-purple-500">{settings.metaTags.length}</p>
        </div>
        <div className={`glass-card p-4 border-l-4 ${settings.debugMode ? 'border-l-yellow-500' : 'border-l-gray-500'}`}>
          <p className="text-sm text-muted-foreground">Debug Mode</p>
          <p className={`font-semibold ${settings.debugMode ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {settings.debugMode ? 'Active' : 'Off'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary/50 text-muted-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Core Settings */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Core Settings
            </h2>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Enable AdSense</p>
                <p className="text-sm text-muted-foreground">Toggle Google AdSense ads across the site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.adsenseEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, adsenseEnabled: e.target.checked }))}
                  className="sr-only peer"
                  aria-label="Enable AdSense"
                  title="Toggle AdSense on or off"
                />
                <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* Publisher ID */}
            <div>
              <label className="block text-sm font-medium mb-2">Publisher ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPublisherId ? "text" : "password"}
                    value={settings.publisherId}
                    onChange={(e) => setSettings(prev => ({ ...prev, publisherId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-20"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPublisherId(!showPublisherId)}
                      className="p-1.5 hover:bg-white/10 rounded"
                      title={showPublisherId ? "Hide" : "Show"}
                    >
                      {showPublisherId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.publisherId, "publisherId")}
                      className="p-1.5 hover:bg-white/10 rounded"
                      title="Copy"
                    >
                      {copiedField === "publisherId" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your Google AdSense publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)</p>
            </div>

            {/* Auto Ads */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Auto Ads</p>
                <p className="text-sm text-muted-foreground">Let Google automatically place ads on your site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAdsEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoAdsEnabled: e.target.checked }))}
                  className="sr-only peer"
                  aria-label="Enable Auto Ads"
                  title="Let Google automatically place ads"
                />
                <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Consent Settings */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">GDPR Consent Settings</h2>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Require User Consent</p>
                <p className="text-sm text-muted-foreground">Show consent banner before loading ads (GDPR compliant)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireConsent}
                  onChange={(e) => setSettings(prev => ({ ...prev, requireConsent: e.target.checked }))}
                  className="sr-only peer"
                  aria-label="Require User Consent"
                  title="Show GDPR consent banner before loading ads"
                />
                <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Consent Message</label>
              <textarea
                value={settings.consentMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, consentMessage: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder="Enter your GDPR consent message..."
              />
            </div>
          </div>

          {/* Debug Mode */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div>
                <p className="font-medium text-yellow-500">Debug Mode</p>
                <p className="text-sm text-muted-foreground">Show ad placement boxes without loading real ads (development only)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
                  className="sr-only peer"
                  aria-label="Enable Debug Mode"
                  title="Show ad placement boxes for development"
                />
                <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Ad Slots Tab */}
      {activeTab === "slots" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Ad Slots Configuration</h2>
            <Button onClick={addAdSlot} variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </div>

          <div className="grid gap-4">
            {settings.adSlots.map((slot) => (
              <div key={slot.id} className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${slot.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => updateAdSlot(slot.id, "name", e.target.value)}
                      className="font-medium bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none"
                      aria-label="Ad slot name"
                      title="Edit ad slot name"
                      placeholder="Ad slot name"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) => updateAdSlot(slot.id, "enabled", e.target.checked)}
                        className="sr-only peer"
                        aria-label={`Enable ${slot.name}`}
                        title={`Toggle ${slot.name} on or off`}
                      />
                      <div className="w-9 h-5 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <button
                      onClick={() => removeAdSlot(slot.id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                      title="Remove slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Slot ID</label>
                    <input
                      type="text"
                      value={slot.slotId}
                      onChange={(e) => updateAdSlot(slot.id, "slotId", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Format</label>
                    <select
                      value={slot.format}
                      onChange={(e) => updateAdSlot(slot.id, "format", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      aria-label="Ad format"
                      title="Select ad format"
                    >
                      <option value="auto">Auto</option>
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                      <option value="rectangle">Rectangle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Position</label>
                    <select
                      value={slot.position}
                      onChange={(e) => updateAdSlot(slot.id, "position", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      aria-label="Ad position"
                      title="Select ad position on page"
                    >
                      <option value="footer">Footer</option>
                      <option value="inContent">In-Content</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="header">Header</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta Tags Tab */}
      {activeTab === "meta" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">Meta Tags</h2>
              <p className="text-sm text-muted-foreground">Add custom meta tags for AdSense verification and configuration</p>
            </div>
            <Button onClick={addMetaTag} variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Meta Tag
            </Button>
          </div>

          <div className="glass-card p-6 space-y-4">
            {settings.metaTags.map((tag) => (
              <div key={tag.id} className="flex gap-4 items-start p-4 rounded-lg bg-secondary/30">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={tag.name}
                      onChange={(e) => updateMetaTag(tag.id, "name", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="google-adsense-account"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Content</label>
                    <input
                      type="text"
                      value={tag.content}
                      onChange={(e) => updateMetaTag(tag.id, "content", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeMetaTag(tag.id)}
                  className="p-2 mt-5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                  title="Remove tag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {settings.metaTags.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No meta tags configured</p>
                <p className="text-sm">Click &quot;Add Meta Tag&quot; to create one</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {settings.metaTags.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Generated HTML Preview
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                {settings.metaTags.map((tag) => (
                  <div key={tag.id}>
                    {`<meta name="${tag.name}" content="${tag.content}" />`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Snippets Tab */}
      {activeTab === "code" && (
        <div className="space-y-6">
          {/* Head Code Snippet */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-500" />
                  Head Code Snippet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Custom code that will be injected into the {"<head>"} section
                </p>
              </div>
              <a
                href="https://www.google.com/adsense/new/u/0/pub-3962865099022579/home"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Get code from AdSense
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <textarea
              value={settings.headCodeSnippet}
              onChange={(e) => setSettings(prev => ({ ...prev, headCodeSnippet: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm text-green-400 resize-none"
              placeholder={`<!-- Paste your AdSense code here -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3962865099022579"
     crossorigin="anonymous"></script>`}
            />
          </div>

          {/* Body Code Snippet */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-500" />
                Body Code Snippet
              </h2>
              <p className="text-sm text-muted-foreground">
                Custom code that will be injected at the end of the {"<body>"} section
              </p>
            </div>

            <textarea
              value={settings.bodyCodeSnippet}
              onChange={(e) => setSettings(prev => ({ ...prev, bodyCodeSnippet: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm text-green-400 resize-none"
              placeholder="<!-- Additional scripts or tracking code -->"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Security Notice</p>
              <p className="text-yellow-500/80">Only add code from trusted sources. Malicious code can compromise your website and user data. Always review code before adding it.</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Getting Started with AdSense</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <a
            href="https://www.google.com/adsense/start/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <p className="font-medium mb-1">Sign Up for AdSense</p>
            <p className="text-muted-foreground">Create your AdSense account and get your publisher ID</p>
          </a>
          <a
            href="https://support.google.com/adsense/answer/9261306"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <p className="font-medium mb-1">Site Verification</p>
            <p className="text-muted-foreground">Learn how to verify your site ownership</p>
          </a>
          <a
            href="https://support.google.com/adsense/answer/9274634"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <p className="font-medium mb-1">Create Ad Units</p>
            <p className="text-muted-foreground">Set up different ad formats for your site</p>
          </a>
        </div>
      </div>
    </div>
  );
}
