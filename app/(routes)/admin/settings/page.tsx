"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Globe, Mail, Shield, Database } from "lucide-react";

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableNewsletter: boolean;
  maintenanceMode: boolean;
  itemsPerPage: number;
  allowComments: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "BioinformaticsHub",
    siteDescription: "Your comprehensive resource for bioinformatics tools, courses, and resources",
    contactEmail: "contact@bioinformaticshub.io",
    enableRegistration: true,
    enableNewsletter: true,
    maintenanceMode: false,
    itemsPerPage: 20,
    allowComments: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage site configuration</p>
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

      {message.text && (
        <div className={`rounded-lg p-4 ${
          message.type === "success" 
            ? "bg-green-500/10 border border-green-500/30 text-green-500" 
            : "bg-red-500/10 border border-red-500/30 text-red-500"
        }`}>
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">General Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium mb-2">Site Name</label>
            <input
              id="siteName"
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="itemsPerPage" className="block text-sm font-medium mb-2">Items Per Page</label>
            <input
              id="itemsPerPage"
              type="number"
              min="5"
              max="100"
              value={settings.itemsPerPage}
              onChange={(e) => setSettings(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) || 20 }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium mb-2">Site Description</label>
          <textarea
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>

      {/* Contact Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Contact Settings</h2>
        </div>
        
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">Contact Email</label>
          <input
            id="contactEmail"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableNewsletter}
              onChange={(e) => setSettings(prev => ({ ...prev, enableNewsletter: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
            />
            <span className="text-sm">Enable Newsletter Subscriptions</span>
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Security Settings</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableRegistration}
              onChange={(e) => setSettings(prev => ({ ...prev, enableRegistration: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
            />
            <span className="text-sm">Allow New User Registration</span>
          </label>


          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowComments}
              onChange={(e) => setSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
            />
            <span className="text-sm">Allow Comments on Posts</span>
          </label>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Authentication Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google */}
          <div className="space-y-3 p-4 border border-white/10 rounded-lg bg-secondary/20">
            <h3 className="font-medium flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google OAuth
            </h3>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Client ID</label>
              <input
                type="text"
                value={settings.googleClientId || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="apps.googleusercontent.com"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Client Secret</label>
              <input
                type="password"
                value={settings.googleClientSecret || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Secret key"
              />
            </div>
          </div>

          {/* GitHub */}
          <div className="space-y-3 p-4 border border-white/10 rounded-lg bg-secondary/20">
            <h3 className="font-medium flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              GitHub OAuth
            </h3>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Client ID</label>
              <input
                type="text"
                value={settings.githubClientId || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, githubClientId: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Iv1..."
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Client Secret</label>
              <input
                type="password"
                value={settings.githubClientSecret || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, githubClientSecret: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Secret key"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary-foreground mt-2">
          Note: While you can save these keys here for simplicity, for production environments it is recommended to use environment variables (GOOGLE_CLIENT_ID, etc).
        </p>
      </div>

      {/* System Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">System Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div>
              <p className="font-medium text-yellow-500">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">When enabled, only admins can access the site</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="maintenanceMode"
                title="Enable Maintenance Mode"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Database Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-muted-foreground">Database</p>
            <p className="font-medium">SQLite</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-muted-foreground">ORM</p>
            <p className="font-medium">Prisma</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-muted-foreground">Framework</p>
            <p className="font-medium">Next.js 16</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-muted-foreground">Environment</p>
            <p className="font-medium">Development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
