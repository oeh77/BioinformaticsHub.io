"use client";

/**
 * Admin SEO Settings Page
 * 
 * Manage site-wide SEO configuration:
 * - Meta tags
 * - Google Analytics
 * - Search Console
 * - Sitemap settings
 * - Robots.txt configuration
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Search, 
  BarChart3, 
  FileText, 
  Globe,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  googleAnalyticsId: string;
  googleSearchConsoleVerification: string;
  twitterHandle: string;
  ogImageUrl: string;
  enableSitemap: boolean;
  enableRobots: boolean;
  sitemapChangeFrequency: string;
  robotsCustomRules: string;
}

const defaultSettings: SEOSettings = {
  siteTitle: "BioinformaticsHub.io",
  siteDescription: "Your comprehensive resource for bioinformatics tools, tutorials, and research workflows.",
  siteKeywords: "bioinformatics, computational biology, genomics, RNA-seq, proteomics",
  googleAnalyticsId: "",
  googleSearchConsoleVerification: "",
  twitterHandle: "@bioinformaticshub",
  ogImageUrl: "/og-default.png",
  enableSitemap: true,
  enableRobots: true,
  sitemapChangeFrequency: "weekly",
  robotsCustomRules: "",
};

export default function SEOSettingsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sitemapStatus, setSitemapStatus] = useState<"ok" | "error" | "unknown">("unknown");
  const [robotsStatus, setRobotsStatus] = useState<"ok" | "error" | "unknown">("unknown");

  useEffect(() => {
    loadSettings();
    checkSEOStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/seo", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error("Failed to load SEO settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSEOStatus = async () => {
    try {
      // Check sitemap
      const sitemapResponse = await fetch("/sitemap.xml", { method: "HEAD" });
      setSitemapStatus(sitemapResponse.ok ? "ok" : "error");

      // Check robots
      const robotsResponse = await fetch("/robots.txt", { method: "HEAD" });
      setRobotsStatus(robotsResponse.ok ? "ok" : "error");
    } catch {
      setSitemapStatus("error");
      setRobotsStatus("error");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Settings Saved",
        description: "SEO settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReindexSitemap = async () => {
    try {
      await fetch("/api/admin/seo/reindex", { method: "POST", credentials: "include" });
      toast({
        title: "Sitemap Regenerated",
        description: "The sitemap has been regenerated successfully.",
      });
      checkSEOStatus();
    } catch {
      toast({
        title: "Error",
        description: "Failed to regenerate sitemap.",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            SEO Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure search engine optimization for your site
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Sitemap"
          status={sitemapStatus}
          href="/sitemap.xml"
        />
        <StatusCard
          title="Robots.txt"
          status={robotsStatus}
          href="/robots.txt"
        />
        <StatusCard
          title="Search Console"
          status={settings.googleSearchConsoleVerification ? "ok" : "unknown"}
          href="https://search.google.com/search-console"
        />
        <StatusCard
          title="Analytics"
          status={settings.googleAnalyticsId ? "ok" : "unknown"}
          href="https://analytics.google.com"
        />
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sitemap">
            <FileText className="h-4 w-4 mr-2" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Search className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General SEO Settings</CardTitle>
              <CardDescription>
                Configure your site&apos;s basic SEO information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  placeholder="BioinformaticsHub.io"
                />
                <p className="text-xs text-muted-foreground">
                  {settings.siteTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="Your comprehensive resource for bioinformatics..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.siteDescription.length}/160 characters (recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteKeywords">Keywords</Label>
                <Textarea
                  id="siteKeywords"
                  value={settings.siteKeywords}
                  onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                  placeholder="bioinformatics, genomics, RNA-seq..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords for search engines
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={settings.twitterHandle}
                    onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                    placeholder="@bioinformaticshub"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">Default OG Image URL</Label>
                  <Input
                    id="ogImageUrl"
                    value={settings.ogImageUrl}
                    onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                    placeholder="/og-default.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                Configure Google Analytics and Search Console
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics Measurement ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Your GA4 measurement ID. Get it from{" "}
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google Analytics
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleSearchConsoleVerification">Google Search Console Verification</Label>
                <Input
                  id="googleSearchConsoleVerification"
                  value={settings.googleSearchConsoleVerification}
                  onChange={(e) => setSettings({ ...settings, googleSearchConsoleVerification: e.target.value })}
                  placeholder="verification_token"
                />
                <p className="text-xs text-muted-foreground">
                  HTML tag verification content. Get it from{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Search Console
                  </a>
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Environment Variables</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  For security, add these to your <code>.env</code> file:
                </p>
                <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_GA_MEASUREMENT_ID=${settings.googleAnalyticsId || "G-XXXXXXXXXX"}
GOOGLE_SITE_VERIFICATION=${settings.googleSearchConsoleVerification || "your_verification_code"}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Configuration</CardTitle>
              <CardDescription>
                Manage your XML sitemap settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Dynamic Sitemap</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically generate XML sitemap from your content
                  </p>
                </div>
                <Switch
                  checked={settings.enableSitemap}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableSitemap: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitemapChangeFrequency">Default Change Frequency</Label>
                <select
                  id="sitemapChangeFrequency"
                  value={settings.sitemapChangeFrequency}
                  onChange={(e) => setSettings({ ...settings, sitemapChangeFrequency: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  aria-label="Sitemap change frequency"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => window.open("/sitemap.xml", "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Sitemap
                </Button>
                <Button variant="outline" onClick={handleReindexSitemap}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Sitemap
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sitemap URLs</h4>
                <ul className="space-y-1 text-sm">
                  <li><code>/sitemap.xml</code> - Main sitemap index</li>
                  <li><code>/sitemap_tools.xml</code> - Tools sitemap</li>
                  <li><code>/sitemap_posts.xml</code> - Blog posts sitemap</li>
                  <li><code>/sitemap_courses.xml</code> - Courses sitemap</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab - Robots.txt Configuration */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            {/* Robots.txt Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 Robots.txt Configuration
                  <Badge variant="secondary" className="ml-2">Expert Mode</Badge>
                </CardTitle>
                <CardDescription>
                  Your robots.txt is automatically generated with expert-level SEO optimization for Google, Bing, and other search engines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                  <div>
                    <Label className="text-green-600 font-medium">✅ Expert SEO Rules Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Crawler-specific rules for Google, Bing, and 10+ other bots
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRobots}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRobots: checked })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => window.open("/robots.txt", "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Robots.txt
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      const response = await fetch("/robots.txt");
                      const text = await response.text();
                      navigator.clipboard.writeText(text);
                      toast({ title: "Copied!", description: "Robots.txt copied to clipboard" });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Crawler Rules Summary */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Search Engine Crawlers</CardTitle>
                <CardDescription>
                  Optimized rules for major search engines to maximize your visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Googlebot", icon: "🔵", status: "Full Access", desc: "Primary + Images" },
                    { name: "Bingbot", icon: "🟢", status: "Full Access", desc: "With crawl-delay" },
                    { name: "Yandex", icon: "🔴", status: "Allowed", desc: "Russian search" },
                    { name: "DuckDuckBot", icon: "🟠", status: "Allowed", desc: "Privacy-focused" },
                    { name: "Applebot", icon: "⚫", status: "Allowed", desc: "Siri & Spotlight" },
                    { name: "Slurp (Yahoo)", icon: "🟣", status: "Allowed", desc: "Via Bing" },
                  ].map((crawler) => (
                    <div key={crawler.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <span className="text-2xl">{crawler.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{crawler.name}</p>
                        <p className="text-xs text-muted-foreground">{crawler.desc}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs">{crawler.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media Bots */}
            <Card>
              <CardHeader>
                <CardTitle>📱 Social Media Bots</CardTitle>
                <CardDescription>
                  Allow social platforms to generate rich link previews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Facebook", icon: "📘", desc: "Link previews & Open Graph" },
                    { name: "Twitter/X", icon: "🐦", desc: "Twitter Cards" },
                    { name: "LinkedIn", icon: "💼", desc: "Professional sharing" },
                  ].map((bot) => (
                    <div key={bot.name} className="flex items-center gap-3 p-3 rounded-lg border">
                      <span className="text-xl">{bot.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{bot.name}</p>
                        <p className="text-xs text-muted-foreground">{bot.desc}</p>
                      </div>
                      <Badge className="ml-auto bg-green-500/10 text-green-600 text-xs">✓ Allowed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blocked Bots */}
            <Card>
              <CardHeader>
                <CardTitle>🛡️ Blocked Bots</CardTitle>
                <CardDescription>
                  AI training bots and aggressive crawlers are blocked to protect your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                    <h4 className="font-medium text-sm mb-2 text-red-600">🤖 AI Training Bots (Blocked)</h4>
                    <div className="flex flex-wrap gap-2">
                      {["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"].map((bot) => (
                        <Badge key={bot} variant="outline" className="text-xs border-red-500/30 text-red-600">
                          {bot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                    <h4 className="font-medium text-sm mb-2 text-orange-600">📊 SEO Tool Bots (Blocked)</h4>
                    <div className="flex flex-wrap gap-2">
                      {["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "BLEXBot"].map((bot) => (
                        <Badge key={bot} variant="outline" className="text-xs border-orange-500/30 text-orange-600">
                          {bot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indexed vs Blocked Paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">✅ Allowed Paths</CardTitle>
                  <CardDescription>High-value content for search indexing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { path: "/directory/", desc: "Tool listings" },
                      { path: "/directory/tool/*", desc: "Tool detail pages" },
                      { path: "/blog/*", desc: "Blog posts" },
                      { path: "/courses/*", desc: "Course content" },
                      { path: "/jobs/*", desc: "Job listings" },
                      { path: "/resources/*", desc: "Resource guides" },
                      { path: "/compare/*", desc: "Tool comparisons" },
                      { path: "/stacks/*", desc: "User stacks" },
                      { path: "/faq", desc: "FAQ page" },
                      { path: "/*.png, *.jpg, *.webp", desc: "Images" },
                    ].map((item) => (
                      <div key={item.path} className="flex justify-between items-center p-2 rounded bg-green-500/5">
                        <code className="text-green-600">{item.path}</code>
                        <span className="text-muted-foreground text-xs">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">🚫 Blocked Paths</CardTitle>
                  <CardDescription>Private, duplicate, or low-value content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { path: "/admin/*", desc: "Admin panel" },
                      { path: "/api/*", desc: "API endpoints" },
                      { path: "/auth/*", desc: "Authentication" },
                      { path: "/user/*", desc: "User profiles" },
                      { path: "/partner/*", desc: "Partner portal" },
                      { path: "/search?*", desc: "Search results" },
                      { path: "/*?page=*", desc: "Pagination params" },
                      { path: "/*?sort=*", desc: "Sort params" },
                      { path: "/go/*", desc: "Affiliate redirects" },
                      { path: "/*?utm_*", desc: "UTM tracking" },
                    ].map((item) => (
                      <div key={item.path} className="flex justify-between items-center p-2 rounded bg-red-500/5">
                        <code className="text-red-600">{item.path}</code>
                        <span className="text-muted-foreground text-xs">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sitemaps */}
            <Card>
              <CardHeader>
                <CardTitle>🗺️ Sitemap References</CardTitle>
                <CardDescription>
                  All sitemaps are referenced in robots.txt for complete content discovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: "Main Index", url: "/sitemap.xml" },
                    { name: "Tools", url: "/sitemap_tools.xml" },
                    { name: "Blog Posts", url: "/sitemap_posts.xml" },
                    { name: "Courses", url: "/sitemap_courses.xml" },
                    { name: "Static Pages", url: "/sitemap_pages.xml" },
                  ].map((sitemap) => (
                    <Button
                      key={sitemap.url}
                      variant="outline"
                      className="justify-start h-auto py-3"
                      onClick={() => window.open(sitemap.url, "_blank")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">{sitemap.name}</p>
                        <p className="text-xs text-muted-foreground">{sitemap.url}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Rules */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Custom Rules (Advanced)</CardTitle>
                <CardDescription>
                  Add additional custom rules to merge with the generated configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="robotsCustomRules">Additional Robots.txt Rules</Label>
                  <Textarea
                    id="robotsCustomRules"
                    value={settings.robotsCustomRules}
                    onChange={(e) => setSettings({ ...settings, robotsCustomRules: e.target.value })}
                    placeholder={`# Add custom rules here
User-agent: SpecificBot
Disallow: /custom-path/

# Example: Allow a previously blocked bot
User-agent: SemrushBot
Allow: /`}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    These rules will be appended to the generated robots.txt. Use this to whitelist or block specific bots.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusCard({ 
  title, 
  status, 
  href 
}: { 
  title: string; 
  status: "ok" | "error" | "unknown";
  href: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(href, "_blank")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">{title}</span>
          {status === "ok" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          {status === "unknown" && <Badge variant="secondary">Not Set</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
