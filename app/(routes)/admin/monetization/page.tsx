// app/(routes)/admin/monetization/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Settings, 
  BarChart3, 
  Zap, 
  Shield, 
  Key,
  Target,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';

interface MonetizationSettings {
  adsEnabled: boolean;
  adDensity: 'low' | 'medium' | 'high';
  carbonEnabled: boolean;
  adsenseEnabled: boolean;
  premiumAdFree: boolean;
  carbonConfig: {
    serveUrl: string;
    placement: string;
    serveId: string;
  };
  adsenseConfig: {
    clientId: string;
    slotFooter: string;
    slotInContent: string;
    slotSidebar: string;
    slotHeader: string;
  };
  pageSettings: {
    tools: boolean;
    blog: boolean;
    courses: boolean;
    jobs: boolean;
    resources: boolean;
    directory: boolean;
    compare: boolean;
    home: boolean;
  };
  placementSettings: {
    header: boolean;
    footer: boolean;
    sidebar: boolean;
    sidebarSticky: boolean;
    inContent: boolean;
    beforeComments: boolean;
    afterHero: boolean;
    betweenCards: boolean;
    endOfPage: boolean;
  };
  abTesting: {
    enabled: boolean;
    sidebarExperiment: boolean;
    footerExperiment: boolean;
    inContentExperiment: boolean;
  };
  debugMode: boolean;
  trackImpressions: boolean;
  trackClicks: boolean;
  gaPropertyId: string;
}

const defaultSettings: MonetizationSettings = {
  adsEnabled: true,
  adDensity: 'medium',
  carbonEnabled: true,
  adsenseEnabled: true,
  premiumAdFree: false,
  carbonConfig: {
    serveUrl: 'https://cdn.carbonads.com/carbon.js',
    placement: 'bioinformaticshubio',
    serveId: '',
  },
  adsenseConfig: {
    clientId: '',
    slotFooter: '',
    slotInContent: '',
    slotSidebar: '',
    slotHeader: '',
  },
  pageSettings: {
    tools: true,
    blog: true,
    courses: true,
    jobs: true,
    resources: true,
    directory: true,
    compare: true,
    home: true,
  },
  placementSettings: {
    header: true,
    footer: true,
    sidebar: true,
    sidebarSticky: true,
    inContent: true,
    beforeComments: false,
    afterHero: true,
    betweenCards: true,
    endOfPage: true,
  },
  abTesting: {
    enabled: false,
    sidebarExperiment: false,
    footerExperiment: false,
    inContentExperiment: false,
  },
  debugMode: false,
  trackImpressions: true,
  trackClicks: true,
  gaPropertyId: '',
};

export default function MonetizationPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MonetizationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/monetization');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/monetization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: '✅ Settings Saved',
          description: 'Monetization settings have been updated.',
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '••••••••' + value.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
          <p className="text-muted-foreground">
            Configure ad networks, placements, and revenue optimization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSecrets(!showSecrets)}>
            {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="placements" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Placements</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">A/B Testing</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Premium</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Master Controls</CardTitle>
                <CardDescription>
                  Global settings for all ad placements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ads-enabled">Enable Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Master toggle for all ads site-wide.
                    </p>
                  </div>
                  <Switch
                    id="ads-enabled"
                    checked={settings.adsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, adsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Log ad events to browser console.
                    </p>
                  </div>
                  <Switch
                    id="debug-mode"
                    checked={settings.debugMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, debugMode: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-density">Ad Density</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Control how many ads appear per page.
                  </p>
                  <Select
                    value={settings.adDensity}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      setSettings({ ...settings, adDensity: value })
                    }
                  >
                    <SelectTrigger id="ad-density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <span className="flex items-center gap-2">
                          🌱 Low (2-3 ads/page)
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-2">
                          ⚖️ Medium (4-5 ads/page)
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="flex items-center gap-2">
                          🔥 High (6+ ads/page)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ad Networks</CardTitle>
                <CardDescription>
                  Toggle individual networks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-sm">
                      C
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="carbon-enabled" className="font-medium">Carbon Ads</Label>
                      <p className="text-xs text-muted-foreground">
                        Premium tech-focused native ads
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="carbon-enabled"
                    checked={settings.carbonEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, carbonEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                      G
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="adsense-enabled" className="font-medium">Google AdSense</Label>
                      <p className="text-xs text-muted-foreground">
                        Display and in-content ads
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="adsense-enabled"
                    checked={settings.adsenseEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, adsenseEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Credentials */}
        <TabsContent value="credentials">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Carbon Ads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-xs">
                      C
                    </div>
                    Carbon Ads
                  </CardTitle>
                  <a 
                    href="https://www.carbonads.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Get credentials <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <CardDescription>
                  Configure your Carbon Ads integration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="carbon-serve-url">Serve URL</Label>
                  <Input
                    id="carbon-serve-url"
                    value={settings.carbonConfig.serveUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carbonConfig: { ...settings.carbonConfig, serveUrl: e.target.value }
                      })
                    }
                    placeholder="https://cdn.carbonads.com/carbon.js"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbon-placement">Placement Name</Label>
                  <Input
                    id="carbon-placement"
                    value={settings.carbonConfig.placement}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carbonConfig: { ...settings.carbonConfig, placement: e.target.value }
                      })
                    }
                    placeholder="your-site-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbon-serve-id">Serve ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="carbon-serve-id"
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.carbonConfig.serveId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          carbonConfig: { ...settings.carbonConfig, serveId: e.target.value }
                        })
                      }
                      placeholder="CKYICKJL"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(settings.carbonConfig.serveId, 'carbon-serve-id')}
                    >
                      {copiedField === 'carbon-serve-id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">
                    Get your Serve ID from the Carbon Ads dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google AdSense */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                      G
                    </div>
                    Google AdSense
                  </CardTitle>
                  <a 
                    href="https://www.google.com/adsense/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Get credentials <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <CardDescription>
                  Configure your Google AdSense integration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adsense-client-id">Publisher ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="adsense-client-id"
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.adsenseConfig.clientId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adsenseConfig: { ...settings.adsenseConfig, clientId: e.target.value }
                        })
                      }
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(settings.adsenseConfig.clientId, 'adsense-client-id')}
                    >
                      {copiedField === 'adsense-client-id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adsense-slot-footer">Footer Slot ID</Label>
                  <Input
                    id="adsense-slot-footer"
                    value={settings.adsenseConfig.slotFooter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        adsenseConfig: { ...settings.adsenseConfig, slotFooter: e.target.value }
                      })
                    }
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adsense-slot-incontent">In-Content Slot ID</Label>
                  <Input
                    id="adsense-slot-incontent"
                    value={settings.adsenseConfig.slotInContent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        adsenseConfig: { ...settings.adsenseConfig, slotInContent: e.target.value }
                      })
                    }
                    placeholder="0987654321"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">
                    Find slot IDs in your AdSense &quot;Ads&quot; section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Placements */}
        <TabsContent value="placements">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placements</CardTitle>
              <CardDescription>
                Configure where ads appear on your pages. Each placement can be independently enabled or disabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 'header', label: 'Header', desc: 'Top navigation area', network: 'Carbon', priority: 'High' },
                  { id: 'footer', label: 'Footer', desc: 'Bottom of page', network: 'AdSense', priority: 'High' },
                  { id: 'sidebar', label: 'Sidebar', desc: 'Side panel (top)', network: 'Carbon', priority: 'High' },
                  { id: 'sidebarSticky', label: 'Sidebar Sticky', desc: 'Scrolls with content', network: 'Carbon', priority: 'High' },
                  { id: 'afterHero', label: 'After Hero', desc: 'Below hero section', network: 'Carbon', priority: 'Medium' },
                  { id: 'inContent', label: 'In-Content', desc: 'Within article text', network: 'AdSense', priority: 'Medium' },
                  { id: 'betweenCards', label: 'Between Cards', desc: 'In listing grids', network: 'AdSense', priority: 'Low' },
                  { id: 'beforeComments', label: 'Before Comments', desc: 'Above reviews/comments', network: 'AdSense', priority: 'Low' },
                  { id: 'endOfPage', label: 'End of Page', desc: 'Before footer', network: 'AdSense', priority: 'Medium' },
                ].map((placement) => (
                  <div key={placement.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`placement-${placement.id}`} className="font-medium">
                          {placement.label}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {placement.network}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            placement.priority === 'High' 
                              ? 'border-green-500/50 text-green-600' 
                              : placement.priority === 'Medium'
                              ? 'border-yellow-500/50 text-yellow-600'
                              : 'border-red-500/50 text-red-600'
                          }`}
                        >
                          {placement.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {placement.desc}
                      </p>
                    </div>
                    <Switch
                      id={`placement-${placement.id}`}
                      checked={settings.placementSettings[placement.id as keyof typeof settings.placementSettings]}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          placementSettings: {
                            ...settings.placementSettings,
                            [placement.id]: checked,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Settings */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Page-Specific Settings</CardTitle>
              <CardDescription>
                Enable or disable ads on specific page types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(settings.pageSettings).map(([page, enabled]) => (
                  <div key={page} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor={`page-${page}`} className="capitalize font-medium">
                        {page} Pages
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        /{page}/*
                      </p>
                    </div>
                    <Switch
                      id={`page-${page}`}
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          pageSettings: {
                            ...settings.pageSettings,
                            [page]: checked,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing */}
        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>
                Run experiments to optimize ad placements and revenue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="space-y-0.5">
                  <Label htmlFor="ab-enabled" className="font-medium">Enable A/B Testing</Label>
                  <p className="text-sm text-muted-foreground">
                    Split traffic between variants to test performance.
                  </p>
                </div>
                <Switch
                  id="ab-enabled"
                  checked={settings.abTesting.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      abTesting: { ...settings.abTesting, enabled: checked }
                    })
                  }
                />
              </div>

              {settings.abTesting.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Sidebar Position</Label>
                        <p className="text-xs text-muted-foreground">
                          Test left vs right sidebar ad placement
                        </p>
                      </div>
                      <Switch
                        checked={settings.abTesting.sidebarExperiment}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            abTesting: { ...settings.abTesting, sidebarExperiment: checked }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">Variant A: Left</Badge>
                      <Badge variant="outline">Variant B: Right</Badge>
                      <Badge variant="secondary">Control: None</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Footer Ad Format</Label>
                        <p className="text-xs text-muted-foreground">
                          Test rectangle vs horizontal format
                        </p>
                      </div>
                      <Switch
                        checked={settings.abTesting.footerExperiment}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            abTesting: { ...settings.abTesting, footerExperiment: checked }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">Variant A: Rectangle</Badge>
                      <Badge variant="outline">Variant B: Horizontal</Badge>
                    </div>
                  </div>
                </div>
              )}

              {!settings.abTesting.enabled && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Enable A/B testing to configure experiments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Settings */}
        <TabsContent value="premium">
          <Card>
            <CardHeader>
              <CardTitle>Premium Experience</CardTitle>
              <CardDescription>
                Configure ad-free experience for premium subscribers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="premium-ad-free" className="font-medium">Ad-Free for Premium Users</Label>
                  <p className="text-sm text-muted-foreground">
                    Premium subscribers won&apos;t see any ads on the site.
                  </p>
                </div>
                <Switch
                  id="premium-ad-free"
                  checked={settings.premiumAdFree}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, premiumAdFree: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuration Summary
          </CardTitle>
          <CardDescription>
            Current monetization configuration at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl font-bold">
                {settings.adsEnabled ? '🟢 Active' : '🔴 Paused'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Networks</p>
              <p className="text-2xl font-bold">
                {[settings.carbonEnabled, settings.adsenseEnabled].filter(Boolean).length}/2
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Placements</p>
              <p className="text-2xl font-bold">
                {Object.values(settings.placementSettings).filter(Boolean).length}/5
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Pages</p>
              <p className="text-2xl font-bold">
                {Object.values(settings.pageSettings).filter(Boolean).length}/5
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Density</p>
              <p className="text-xl font-bold capitalize">{settings.adDensity}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
