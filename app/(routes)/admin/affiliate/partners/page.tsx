"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react";

interface Partner {
  id: string;
  companyName: string;
  slug: string;
  industryCategory: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  commissionRate: number;
  commissionType: string;
  status: string;
  createdAt: string;
  _count: {
    products: number;
    links: number;
    conversions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PartnersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open modal when action=create is in URL
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowCreateModal(true);
      // Clean up the URL
      router.replace("/admin/affiliate/partners", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchPartners();
  }, [statusFilter, categoryFilter]);

  async function fetchPartners(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/partners?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch partners");

      const data = await response.json();
      setPartners(data.partners);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPartners();
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    paused: "bg-orange-500/20 text-orange-400",
    terminated: "bg-red-500/20 text-red-400",
  };

  const categoryLabels: Record<string, string> = {
    software: "Software & SaaS",
    equipment: "Lab Equipment",
    services: "Services",
    education: "Education",
    reagents: "Reagents & Chemicals",
    cloud: "Cloud Computing",
    consumables: "Consumables",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Partners</h1>
          <p className="text-white/60">Manage your affiliate partner relationships</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by partner status"
            aria-label="Filter by partner status"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="paused">Paused</option>
            <option value="terminated">Terminated</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            title="Filter by industry category"
            aria-label="Filter by industry category"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Categories</option>
            <option value="software">Software</option>
            <option value="equipment">Equipment</option>
            <option value="services">Services</option>
            <option value="education">Education</option>
            <option value="reagents">Reagents</option>
            <option value="cloud">Cloud</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Partner
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Commission
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Products
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Conversions
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
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-8 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No partners found</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 text-primary hover:underline"
                    >
                      Add your first partner
                    </button>
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {partner.logoUrl ? (
                          <img
                            src={partner.logoUrl}
                            alt={partner.companyName}
                            className="w-10 h-10 rounded-lg object-cover bg-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white/40" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-white/60">{partner.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {categoryLabels[partner.industryCategory] ||
                          partner.industryCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">
                        {partner.commissionRate}%
                      </span>
                      <span className="text-white/60 text-sm ml-1">
                        ({partner.commissionType})
                      </span>
                    </td>
                    <td className="px-6 py-4">{partner._count.products}</td>
                    <td className="px-6 py-4">{partner._count.conversions}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          statusColors[partner.status]
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {partner.websiteUrl && (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Visit ${partner.companyName} website`}
                            aria-label={`Visit ${partner.companyName} website`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/affiliate/partners/${partner.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
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
              {pagination.total} partners
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPartners(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPartners(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Partner Modal */}
      {showCreateModal && (
        <CreatePartnerModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchPartners();
          }}
        />
      )}
    </div>
  );
}

// Create Partner Modal Component
function CreatePartnerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    companyName: "",
    slug: "",
    industryCategory: "software",
    websiteUrl: "",
    description: "",
    commissionRate: 10,
    commissionType: "percentage",
    cookieDuration: 30,
    contactName: "",
    contactEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClasses = "w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium mb-2 text-foreground";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/affiliate/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          websiteUrl: formData.websiteUrl || null,
          contactEmail: formData.contactEmail || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create partner");
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Add New Partner</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create a new affiliate partnership
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    companyName: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                required
                className={inputClasses}
                placeholder="e.g., Illumina"
              />
            </div>
            <div>
              <label className={labelClasses}>Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
                className={inputClasses}
                placeholder="e.g., illumina"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Industry Category *
              </label>
              <select
                value={formData.industryCategory}
                onChange={(e) =>
                  setFormData({ ...formData, industryCategory: e.target.value })
                }
                title="Select industry category"
                aria-label="Select industry category"
                className={inputClasses}
              >
                <option value="software">Software & SaaS</option>
                <option value="equipment">Lab Equipment</option>
                <option value="services">Services</option>
                <option value="education">Education</option>
                <option value="reagents">Reagents & Chemicals</option>
                <option value="cloud">Cloud Computing</option>
                <option value="consumables">Consumables</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                className={inputClasses}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={inputClasses}
              placeholder="Brief description of the partner..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>
                Commission Rate (%)
              </label>
              <input
                type="number"
                title="Commission Rate"
                placeholder="10"
                value={formData.commissionRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commissionRate: parseFloat(e.target.value),
                  })
                }
                min="0"
                max="100"
                step="0.1"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                Commission Type
              </label>
              <select
                value={formData.commissionType}
                onChange={(e) =>
                  setFormData({ ...formData, commissionType: e.target.value })
                }
                title="Select commission type"
                aria-label="Select commission type"
                className={inputClasses}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="tiered">Tiered</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>
                Cookie Duration (days)
              </label>
              <input
                type="number"
                title="Cookie Duration"
                placeholder="30"
                value={formData.cookieDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cookieDuration: parseInt(e.target.value),
                  })
                }
                min="1"
                max="365"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Contact Name
              </label>
              <input
                type="text"
                title="Contact Name"
                placeholder="John Doe"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                Contact Email
              </label>
              <input
                type="email"
                title="Contact Email"
                placeholder="john@example.com"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className={inputClasses}
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
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
