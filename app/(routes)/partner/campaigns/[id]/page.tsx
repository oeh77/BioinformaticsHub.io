'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Calendar, 
  TrendingUp, 
  MousePointer, 
  ShoppingCart, 
  DollarSign,
  Clock,
  Tag,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Link2,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus
} from 'lucide-react';

interface CampaignDetails {
  campaign: {
    id: string;
    campaignName: string;
    description: string | null;
    campaignType: string;
    status: string;
    startDate: string;
    endDate: string | null;
    discountCode: string | null;
    discountAmount: number | null;
    discountType: string | null;
    bonusCommission: number | null;
    landingPageUrl: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    creativesUrls: string[];
  };
  partnerStats: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCommission: number;
    conversionRate: number;
    averageOrderValue: number;
    linksCreated: number;
    effectiveBonusCommission: number | null;
  };
  period: {
    start: string;
    end: string;
  };
  charts: {
    dailyPerformance: Array<{ date: string; clicks: number; conversions: number; revenue: number }>;
  };
  links: Array<{
    id: string;
    shortCode: string;
    name: string | null;
    productName: string | null;
    status: string;
    clicks: number;
    conversions: number;
    commission: number;
    conversionRate: number;
  }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerCampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [data, setData] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignDetails();
  }, [resolvedParams.id, period]);

  async function fetchCampaignDetails() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/partner/campaigns/${resolvedParams.id}?period=${period}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
          <Link href="/partner/campaigns" className="text-primary hover:underline">
            ← Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const { campaign, partnerStats, links, charts } = data;

  // Calculate days remaining
  const daysRemaining = campaign.endDate 
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/partner" className="hover:text-foreground">Partner Portal</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/partner/campaigns" className="hover:text-foreground">Campaigns</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{campaign.campaignName}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{campaign.campaignName}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  campaign.status === 'active' 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {campaign.status}
                </span>
              </div>
              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Period Filter */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                title="Select time period"
                className="px-4 py-2 rounded-lg glass border border-white/20 bg-transparent focus:border-primary outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="14d">Last 14 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>

              {campaign.landingPageUrl && (
                <a
                  href={campaign.landingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg glass border border-white/20 hover:border-primary/50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Landing Page
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="font-semibold">
              {new Date(campaign.startDate).toLocaleDateString()} 
              {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
            </p>
            {daysRemaining !== null && campaign.status === 'active' && (
              <p className={`text-sm ${daysRemaining < 7 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                {daysRemaining} days remaining
              </p>
            )}
          </div>

          {campaign.discountCode && (
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Discount Code</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold text-green-400">{campaign.discountCode}</code>
                <button
                  onClick={() => copyToClipboard(campaign.discountCode!, 'discount')}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Copy code"
                >
                  {copiedCode === 'discount' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {campaign.discountAmount && (
                <p className="text-sm text-muted-foreground">
                  {campaign.discountType === 'percentage' 
                    ? `${campaign.discountAmount}% off` 
                    : `$${campaign.discountAmount} off`}
                </p>
              )}
            </div>
          )}

          {campaign.bonusCommission && (
            <div className="glass-card p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Bonus Commission</span>
              </div>
              <p className="font-bold text-2xl text-purple-400">+{campaign.bonusCommission}%</p>
              <p className="text-sm text-muted-foreground">Extra on all sales</p>
            </div>
          )}

          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Your Links</span>
            </div>
            <p className="font-bold text-2xl">{partnerStats.linksCreated}</p>
            <Link 
              href="/partner/links" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Create more <Plus className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <MousePointer className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">{partnerStats.totalClicks.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Clicks</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-green-400 flex items-center gap-1">
                {partnerStats.conversionRate}%
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-bold">{partnerStats.totalConversions.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Conversions</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">${partnerStats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Revenue Generated</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-green-500/30 bg-green-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${partnerStats.totalCommission.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Your Commission</p>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        {charts.dailyPerformance.length > 0 && (
          <div className="glass-card p-6 rounded-xl border border-white/10 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Over Time
            </h2>
            <div className="h-48 flex items-end gap-1">
              {charts.dailyPerformance.slice(-30).map((day, i) => {
                const maxClicks = Math.max(...charts.dailyPerformance.map(d => d.clicks));
                const height = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t group relative"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${day.clicks} clicks, ${day.conversions} conversions`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-white/20 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      <div className="font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                      <div>{day.clicks} clicks</div>
                      <div>{day.conversions} sales</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{charts.dailyPerformance[0]?.date ? new Date(charts.dailyPerformance[0].date).toLocaleDateString() : ''}</span>
              <span>
                {charts.dailyPerformance.length > 0 
                  ? new Date(charts.dailyPerformance[charts.dailyPerformance.length - 1].date).toLocaleDateString() 
                  : ''}
              </span>
            </div>
          </div>
        )}

        {/* Campaign Links */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Your Campaign Links
            </h2>
            <Link
              href={`/partner/links?campaign=${resolvedParams.id}`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </Link>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
              <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No links created yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first link for this campaign to start earning
              </p>
              <Link
                href={`/partner/links?campaign=${resolvedParams.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Create Link
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-4 font-medium text-muted-foreground">Link</th>
                    <th className="pb-4 font-medium text-muted-foreground">Product</th>
                    <th className="pb-4 font-medium text-muted-foreground text-right">Clicks</th>
                    <th className="pb-4 font-medium text-muted-foreground text-right">Sales</th>
                    <th className="pb-4 font-medium text-muted-foreground text-right">Conv. Rate</th>
                    <th className="pb-4 font-medium text-muted-foreground text-right">Commission</th>
                    <th className="pb-4 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-primary">/{link.shortCode}</code>
                          {link.name && (
                            <span className="text-sm text-muted-foreground">({link.name})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm">{link.productName || '-'}</td>
                      <td className="py-4 text-right font-medium">{link.clicks.toLocaleString()}</td>
                      <td className="py-4 text-right font-medium">{link.conversions}</td>
                      <td className="py-4 text-right">
                        <span className={link.conversionRate > 2 ? 'text-green-400' : ''}>
                          {link.conversionRate}%
                        </span>
                      </td>
                      <td className="py-4 text-right font-medium text-green-400">
                        ${link.commission.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/go/${link.shortCode}`, link.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedCode === link.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Creatives Section */}
        {campaign.creativesUrls && campaign.creativesUrls.length > 0 && (
          <div className="glass-card p-6 rounded-xl border border-white/10 mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Campaign Creatives
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.creativesUrls.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group"
                >
                  <img 
                    src={url} 
                    alt={`Creative ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
