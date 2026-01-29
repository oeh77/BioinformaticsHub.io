"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  X,
  Eye,
  Pause,
  Play,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Campaign {
  id: string;
  campaignName: string;
  slug: string;
  description: string | null;
  campaignType: string;
  partnerId: string | null;
  startDate: string;
  endDate: string | null;
  budgetAmount: number | null;
  discountCode: string | null;
  bonusCommission: number | null;
  status: string;
  createdAt: string;
  partner: {
    id: string;
    companyName: string;
  } | null;
  stats: {
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
    linksCount: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: "bg-gray-500/20", text: "text-gray-400", icon: Clock },
  active: { bg: "bg-green-500/20", text: "text-green-400", icon: Play },
  paused: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Pause },
  completed: { bg: "bg-blue-500/20", text: "text-blue-400", icon: CheckCircle },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", icon: AlertCircle },
};

const typeIcons: Record<string, string> = {
  seasonal: "🎄",
  product_launch: "🚀",
  promotion: "🏷️",
  evergreen: "🌲",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, typeFilter]);

  async function fetchCampaigns(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/campaigns?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch campaigns");

      const data = await response.json();
      setCampaigns(data.campaigns);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateCampaignStatus(campaignId: string, status: string) {
    try {
      const response = await fetch(`/api/admin/affiliate/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update campaign");

      fetchCampaigns(pagination?.page || 1);
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert("Failed to update campaign status");
    }
  }

  function getCampaignStatus(campaign: Campaign): "scheduled" | "active" | "ended" | "paused" | "draft" {
    if (campaign.status === "draft") return "draft";
    if (campaign.status === "paused") return "paused";
    if (campaign.status === "cancelled" || campaign.status === "completed") return "ended";

    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = campaign.endDate ? new Date(campaign.endDate) : null;

    if (start > now) return "scheduled";
    if (end && end < now) return "ended";
    return "active";
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Calculate aggregate stats
  const totalStats = campaigns.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.stats.clicks,
      conversions: acc.conversions + c.stats.conversions,
      revenue: acc.revenue + c.stats.revenue,
    }),
    { clicks: 0, conversions: 0, revenue: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-white/60">Manage promotional affiliate campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Total Campaigns</span>
          </div>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold">{totalStats.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Conversions</span>
          </div>
          <p className="text-2xl font-bold">{totalStats.conversions.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-white/60 text-sm">Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalStats.revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filter by campaign status"
          aria-label="Filter by campaign status"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="ended">Ended</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          title="Filter by campaign type"
          aria-label="Filter by campaign type"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Types</option>
          <option value="seasonal">Seasonal</option>
          <option value="product_launch">Product Launch</option>
          <option value="promotion">Promotion</option>
          <option value="evergreen">Evergreen</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl border border-white/10 p-6 animate-pulse"
            >
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
              <div className="h-4 bg-white/10 rounded w-1/2 mb-6" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-white/10 rounded" />
                <div className="h-12 bg-white/10 rounded" />
              </div>
              <div className="h-10 bg-white/10 rounded" />
            </div>
          ))
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-white/60 mb-4">No campaigns found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign);
            const StatusIcon = statusColors[campaign.status]?.icon || Clock;

            return (
              <div
                key={campaign.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-colors overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[campaign.campaignType] || "📢"}</span>
                      <h3 className="font-semibold line-clamp-1">{campaign.campaignName}</h3>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        statusColors[campaign.status]?.bg
                      } ${statusColors[campaign.status]?.text}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status}
                    </span>
                  </div>
                  {campaign.partner && (
                    <p className="text-sm text-white/60">{campaign.partner.companyName}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Clicks</p>
                    <p className="text-lg font-semibold">{campaign.stats.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Conversions</p>
                    <p className="text-lg font-semibold">{campaign.stats.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {formatCurrency(campaign.stats.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Links</p>
                    <p className="text-lg font-semibold">{campaign.stats.linksCount}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    {formatDate(campaign.startDate)}
                    {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                  </div>
                  {campaign.discountCode && (
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                      <Tag className="w-3 h-3" />
                      Code: <span className="font-mono">{campaign.discountCode}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <Link
                    href={`/admin/affiliate/campaigns/${campaign.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  {campaign.status === "active" && (
                    <button
                      onClick={() => updateCampaignStatus(campaign.id, "paused")}
                      title="Pause campaign"
                      aria-label="Pause campaign"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {campaign.status === "paused" && (
                    <button
                      onClick={() => updateCampaignStatus(campaign.id, "active")}
                      title="Resume campaign"
                      aria-label="Resume campaign"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} campaigns
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchCampaigns(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
            >
              Previous
            </button>
            <button
              onClick={() => fetchCampaigns(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}

// Create Campaign Modal
function CreateCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    campaignName: "",
    slug: "",
    description: "",
    campaignType: "promotion",
    partnerId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    budgetAmount: "",
    discountCode: "",
    discountAmount: "",
    discountType: "percentage",
    bonusCommission: "",
    targetClicks: "",
    targetConversions: "",
    targetRevenue: "",
    landingPageUrl: "",
  });
  const [partners, setPartners] = useState<Array<{ id: string; companyName: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Semantic Classes
  const inputClasses = "w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium mb-2 text-foreground";
  const modalClasses = "bg-card text-card-foreground rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl";

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const response = await fetch("/api/admin/affiliate/partners?status=active&limit=100", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners);
      }
    } catch (e) {
      console.error("Failed to fetch partners", e);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      campaignName: name,
      slug: generateSlug(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        campaignName: formData.campaignName,
        slug: formData.slug,
        description: formData.description || undefined,
        campaignType: formData.campaignType,
        partnerId: formData.partnerId || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : undefined,
        discountCode: formData.discountCode || undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        discountType: formData.discountCode ? formData.discountType : undefined,
        bonusCommission: formData.bonusCommission ? parseFloat(formData.bonusCommission) : undefined,
        targetClicks: formData.targetClicks ? parseInt(formData.targetClicks) : undefined,
        targetConversions: formData.targetConversions ? parseInt(formData.targetConversions) : undefined,
        targetRevenue: formData.targetRevenue ? parseFloat(formData.targetRevenue) : undefined,
        landingPageUrl: formData.landingPageUrl || undefined,
        utmCampaign: formData.slug,
      };

      const response = await fetch("/api/admin/affiliate/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={modalClasses}>
        <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold">Create Campaign</h2>
            <p className="text-muted-foreground text-sm">Set up a new affiliate campaign</p>
          </div>
          <button
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClasses}>Campaign Name *</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={inputClasses}
                  placeholder="Summer Sale 2024"
                />
              </div>
              <div>
                <label className={labelClasses}>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className={inputClasses}
                  placeholder="summer-sale-2024"
                />
              </div>
              <div>
                <label className={labelClasses}>Type</label>
                <select
                  value={formData.campaignType}
                  onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                  title="Select campaign type"
                  aria-label="Select campaign type"
                  className={inputClasses}
                >
                  <option value="promotion">🏷️ Promotion</option>
                  <option value="seasonal">🎄 Seasonal</option>
                  <option value="product_launch">🚀 Product Launch</option>
                  <option value="evergreen">🌲 Evergreen</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className={inputClasses}
                placeholder="Campaign details..."
              />
            </div>
            <div>
              <label className={labelClasses}>Partner (Optional)</label>
              <select
                value={formData.partnerId}
                onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                title="Select partner (optional)"
                aria-label="Select partner (optional)"
                className={inputClasses}
              >
                <option value="">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  title="Campaign start date"
                  aria-label="Campaign start date"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  title="Campaign end date"
                  aria-label="Campaign end date"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Discount (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>Discount Code</label>
                <input
                  type="text"
                  value={formData.discountCode}
                  onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                  className={`${inputClasses} font-mono`}
                  placeholder="SUMMER20"
                />
              </div>
              <div>
                <label className={labelClasses}>Amount</label>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  className={inputClasses}
                  placeholder="20"
                />
              </div>
              <div>
                <label className={labelClasses}>Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  title="Select discount type"
                  aria-label="Select discount type"
                  className={inputClasses}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Targets */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Targets (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>Target Clicks</label>
                <input
                  type="number"
                  value={formData.targetClicks}
                  onChange={(e) => setFormData({ ...formData, targetClicks: e.target.value })}
                  className={inputClasses}
                  placeholder="10000"
                />
              </div>
              <div>
                <label className={labelClasses}>Target Conversions</label>
                <input
                  type="number"
                  value={formData.targetConversions}
                  onChange={(e) => setFormData({ ...formData, targetConversions: e.target.value })}
                  className={inputClasses}
                  placeholder="500"
                />
              </div>
              <div>
                <label className={labelClasses}>Target Revenue</label>
                <input
                  type="number"
                  value={formData.targetRevenue}
                  onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                  className={inputClasses}
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
