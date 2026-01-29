"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  QrCode,
} from "lucide-react";

interface AffiliateLink {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  trackingUrl: string;
  linkType: string;
  placementType: string;
  status: string;
  totalClicks: number;
  totalConversions: number;
  createdAt: string;
  partner: {
    id: string;
    companyName: string;
  };
  product: {
    id: string;
    productName: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const placementLabels: Record<string, string> = {
  content: "In Content",
  banner: "Banner",
  button: "Button",
  widget: "Widget",
  email: "Email",
  sidebar: "Sidebar",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  paused: "bg-yellow-500/20 text-yellow-400",
  expired: "bg-red-500/20 text-red-400",
};

export default function LinksPage() {
  const searchParams = useSearchParams();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const initialPartnerId = searchParams.get("partnerId");
  const initialProductId = searchParams.get("productId");

  useEffect(() => {
    fetchLinks();
  }, [placementFilter]);

  async function fetchLinks(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(initialPartnerId && { partnerId: initialPartnerId }),
        ...(initialProductId && { productId: initialProductId }),
        ...(placementFilter && { placementType: placementFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/links?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch links");

      const data = await response.json();
      setLinks(data.links);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function calculateConversionRate(clicks: number, conversions: number): string {
    if (clicks === 0) return "0%";
    return ((conversions / clicks) * 100).toFixed(2) + "%";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Links</h1>
          <p className="text-white/60">Generate and manage tracking links</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Generate Link
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            <span className="text-white/60 text-sm">Total Links</span>
          </div>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold">
            {links.reduce((sum, l) => sum + l.totalClicks, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Total Conversions</span>
          </div>
          <p className="text-2xl font-bold">
            {links.reduce((sum, l) => sum + l.totalConversions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Avg. Conversion Rate</span>
          </div>
          <p className="text-2xl font-bold">
            {calculateConversionRate(
              links.reduce((sum, l) => sum + l.totalClicks, 0),
              links.reduce((sum, l) => sum + l.totalConversions, 0)
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={placementFilter}
          onChange={(e) => setPlacementFilter(e.target.value)}
          title="Filter by link placement type"
          aria-label="Filter by link placement type"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Placements</option>
          {Object.entries(placementLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Links Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Link
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Partner / Product
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Placement
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Clicks
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Conv.
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Rate
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-8 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                    <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No links found</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 text-primary hover:underline"
                    >
                      Generate your first link
                    </button>
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <code className="text-sm font-mono text-primary">
                          /go/{link.shortCode}
                        </code>
                        <p className="text-xs text-white/40 mt-1 truncate max-w-[200px]">
                          {link.originalUrl}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{link.partner.companyName}</p>
                        {link.product && (
                          <p className="text-sm text-white/60">{link.product.productName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {placementLabels[link.placementType] || link.placementType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {link.totalClicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {link.totalConversions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {calculateConversionRate(link.totalClicks, link.totalConversions)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[link.status]}`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(link.shortUrl, link.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy short URL"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-white/60">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} links
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLinks(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLinks(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchLinks();
          }}
          initialPartnerId={initialPartnerId}
          initialProductId={initialProductId}
        />
      )}
    </div>
  );
}

// Create Link Modal
function CreateLinkModal({
  onClose,
  onCreated,
  initialPartnerId,
  initialProductId,
}: {
  onClose: () => void;
  onCreated: () => void;
  initialPartnerId: string | null;
  initialProductId: string | null;
}) {
  const [partners, setPartners] = useState<Array<{ id: string; companyName: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; productName: string; affiliateUrl: string | null }>>([]);
  const [formData, setFormData] = useState({
    partnerId: initialPartnerId || "",
    productId: initialProductId || "",
    originalUrl: "",
    placementType: "content",
    utmSource: "bioinformaticshub",
    utmMedium: "affiliate",
    utmCampaign: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedLink, setGeneratedLink] = useState<{ shortUrl: string; trackingUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Semantic Classes
  const inputClasses = "w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium mb-2 text-foreground";
  const modalClasses = "bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]";

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (formData.partnerId) {
      fetchProducts(formData.partnerId);
    }
  }, [formData.partnerId]);

  async function fetchPartners() {
    try {
      const response = await fetch("/api/admin/affiliate/partners?limit=100&status=active", {
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

  async function fetchProducts(partnerId: string) {
    try {
      const response = await fetch(`/api/admin/affiliate/products?partnerId=${partnerId}&limit=100`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          productId: formData.productId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create link");
      }

      const data = await response.json();
      setGeneratedLink({
        shortUrl: data.shortUrl,
        trackingUrl: data.trackingUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleProductSelect(productId: string) {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      originalUrl: product?.affiliateUrl || formData.originalUrl,
    });
  }

  function copyLink() {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (generatedLink) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={modalClasses}>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Link Generated!</h2>
              <p className="text-muted-foreground text-sm mt-1">Your affiliate link is ready to use</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Short URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink.shortUrl}
                    readOnly
                    className={`flex-1 ${inputClasses} font-mono text-sm`}
                    title="Short URL"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                    title="Copy generated link"
                    aria-label="Copy generated link"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Full Tracking URL</label>
                <textarea
                  value={generatedLink.trackingUrl}
                  readOnly
                  rows={3}
                  className={`${inputClasses} font-mono text-xs`}
                  title="Full Tracking URL"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setGeneratedLink(null);
                  setFormData({
                    partnerId: initialPartnerId || "",
                    productId: initialProductId || "",
                    originalUrl: "",
                    placementType: "content",
                    utmSource: "bioinformaticshub",
                    utmMedium: "affiliate",
                    utmCampaign: "",
                  });
                }}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={onCreated}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={modalClasses}>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Generate Affiliate Link</h2>
          <p className="text-muted-foreground text-sm mt-1">Create a new trackable affiliate link</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={labelClasses}>Partner *</label>
            <select
              value={formData.partnerId}
              onChange={(e) => setFormData({ ...formData, partnerId: e.target.value, productId: "" })}
              required
              title="Select affiliate partner"
              aria-label="Select affiliate partner"
              className={inputClasses}
            >
              <option value="">Select a partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Product (Optional)</label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={!formData.partnerId}
              title="Select product (optional)"
              aria-label="Select product (optional)"
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="">All Products / Homepage</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Destination URL *</label>
            <input
              type="url"
              value={formData.originalUrl}
              onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
              required
              className={inputClasses}
              placeholder="https://partner.com/product?ref=..."
            />
          </div>

          <div>
            <label className={labelClasses}>Link Placement</label>
            <select
              value={formData.placementType}
              onChange={(e) => setFormData({ ...formData, placementType: e.target.value })}
              title="Select link placement type"
              aria-label="Select link placement type"
              className={inputClasses}
            >
              {Object.entries(placementLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>UTM Source</label>
              <input
                type="text"
                value={formData.utmSource}
                onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                className={inputClasses}
                placeholder="bioinformaticshub"
                title="UTM Source"
              />
            </div>
            <div>
              <label className={labelClasses}>UTM Campaign</label>
              <input
                type="text"
                value={formData.utmCampaign}
                onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                className={inputClasses}
                placeholder="e.g., summer-promo"
                title="UTM Campaign"
              />
            </div>
          </div>

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
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
