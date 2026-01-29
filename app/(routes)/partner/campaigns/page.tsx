'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  Sparkles,
  Target,
  Gift,
  ArrowRight
} from 'lucide-react';

interface Campaign {
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
  linksCount: number;
  isPartnerSpecific: boolean;
  stats: {
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
  };
}

// Status badge colors
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'scheduled':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'paused':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'completed':
    case 'ended':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

// Type badge colors
function getTypeIcon(type: string) {
  switch (type) {
    case 'seasonal':
      return Calendar;
    case 'product_launch':
      return Sparkles;
    case 'promotion':
      return Gift;
    case 'evergreen':
      return Target;
    default:
      return Megaphone;
  }
}

export default function PartnerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, page]);

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/partner/campaigns?status=${statusFilter}&page=${page}&limit=12`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await res.json();
      setCampaigns(data.campaigns);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.stats.clicks,
      conversions: acc.conversions + c.stats.conversions,
      commission: acc.commission + c.stats.commission,
    }),
    { clicks: 0, conversions: 0, commission: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/partner" className="hover:text-foreground">Partner Portal</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">Campaigns</span>
              </nav>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-purple-400" />
                Active Campaigns
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover promotional campaigns and boost your earnings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <MousePointer className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.clicks.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.conversions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totals.commission.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Your Commission</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <div className="flex gap-2">
            {['active', 'scheduled', 'completed', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'glass border border-white/10 hover:border-primary/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-xl border border-white/10 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                <div className="h-20 bg-white/10 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl border border-white/10">
            <Megaphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Campaigns Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'active' 
                ? 'There are no active campaigns right now. Check back soon!'
                : `No ${statusFilter} campaigns available.`}
            </p>
          </div>
        ) : (
          <>
            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.campaignType);
                const isEnding = campaign.endDate && 
                  new Date(campaign.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                return (
                  <Link
                    key={campaign.id}
                    href={`/partner/campaigns/${campaign.id}`}
                    className="glass-card p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all group"
                  >
                    {/* Campaign Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <TypeIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {campaign.campaignName}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {campaign.campaignType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>

                    {/* Description */}
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {campaign.description}
                      </p>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                      </div>
                      {campaign.endDate && (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span className={isEnding ? 'text-yellow-400' : ''}>
                            {new Date(campaign.endDate).toLocaleDateString()}
                            {isEnding && ' (Ending soon!)'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Promo Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {campaign.discountCode && (
                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {campaign.discountCode}
                          {campaign.discountAmount && (
                            <span>
                              ({campaign.discountType === 'percentage' 
                                ? `${campaign.discountAmount}%` 
                                : `$${campaign.discountAmount}`} off)
                            </span>
                          )}
                        </span>
                      )}
                      {campaign.bonusCommission && (
                        <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          +{campaign.bonusCommission}% Bonus
                        </span>
                      )}
                      {campaign.isPartnerSpecific && (
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
                          Exclusive
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-lg font-bold">{campaign.stats.clicks}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{campaign.stats.conversions}</p>
                        <p className="text-xs text-muted-foreground">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">
                          ${campaign.stats.commission.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-sm text-muted-foreground">
                        {campaign.linksCount} link{campaign.linksCount !== 1 ? 's' : ''} created
                      </span>
                      <span className="text-primary flex items-center gap-1 text-sm font-medium">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? 'bg-primary text-primary-foreground'
                        : 'glass border border-white/10 hover:border-primary/50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
