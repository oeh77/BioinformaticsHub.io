"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  ExternalLink,
  Edit,
  Star,
  StarOff,
  Eye,
} from "lucide-react";

interface Product {
  id: string;
  productName: string;
  slug: string;
  productCategory: string;
  price: number | null;
  pricingModel: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  partner: {
    id: string;
    companyName: string;
  };
  _count: {
    links: number;
    clicks: number;
    conversions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const categoryLabels: Record<string, string> = {
  sequencer: "Sequencer",
  software: "Software",
  cloud: "Cloud",
  reagent: "Reagent",
  course: "Course",
  book: "Book",
  equipment: "Equipment",
  consumable: "Consumable",
  service: "Service",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-gray-500/20 text-gray-400",
  out_of_stock: "bg-red-500/20 text-red-400",
};

const pricingLabels: Record<string, string> = {
  one_time: "One-time",
  subscription: "Subscription",
  usage_based: "Usage-based",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter]);

  async function fetchProducts(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/products?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProducts();
  }

  function formatPrice(price: number | null, model: string): string {
    if (price === null) return model === "usage_based" ? "Pay-per-use" : "Contact";
    if (model === "subscription") return `$${price.toLocaleString()}/mo`;
    return `$${price.toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Products</h1>
          <p className="text-white/60">Manage product catalog and affiliate URLs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            title="Filter by product category"
            aria-label="Filter by product category"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by product status"
            aria-label="Filter by product status"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-xl animate-pulse border border-white/10"
            />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-white/60">
            <Package className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-4">No products found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-primary hover:underline"
            >
              Add your first product
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-colors group"
            >
              {/* Product Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      statusColors[product.status]
                    }`}
                  >
                    {product.status}
                  </span>
                  {product.isFeatured && (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                  {product.productName}
                </h3>
                <p className="text-sm text-white/60">{product.partner.companyName}</p>
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Category</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                    {categoryLabels[product.productCategory] || product.productCategory}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Price</span>
                  <span className="font-medium">
                    {formatPrice(product.price, product.pricingModel)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Pricing</span>
                  <span>{pricingLabels[product.pricingModel]}</span>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{product._count.links}</p>
                    <p className="text-xs text-white/60">Links</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{product._count.clicks}</p>
                    <p className="text-xs text-white/60">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{product._count.conversions}</p>
                    <p className="text-xs text-white/60">Sales</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-white/10">
                <Link
                  href={`/admin/affiliate/products/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm hover:bg-white/5 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <Link
                  href={`/admin/affiliate/links?productId=${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm hover:bg-white/5 transition-colors border-l border-white/10"
                >
                  <Eye className="w-4 h-4" />
                  Links
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
            >
              Previous
            </button>
            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

// Create Product Modal
function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [partners, setPartners] = useState<Array<{ id: string; companyName: string }>>([]);
  const [formData, setFormData] = useState({
    partnerId: "",
    productName: "",
    slug: "",
    productCategory: "software",
    description: "",
    price: "",
    pricingModel: "one_time",
    productUrl: "",
    affiliateUrl: "",
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClasses = "w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium mb-2 text-foreground";

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const response = await fetch("/api/admin/affiliate/partners?limit=100", {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/affiliate/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          productUrl: formData.productUrl || null,
          affiliateUrl: formData.affiliateUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create product");
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
          <h2 className="text-xl font-bold">Add New Product</h2>
          <p className="text-muted-foreground text-sm mt-1">Add a product to your affiliate catalog</p>
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
              onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Product Name *</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    productName: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                required
                className={inputClasses}
                placeholder="e.g., NovaSeq 6000"
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
                placeholder="e.g., novaseq-6000"
                title="Product slug"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Category *</label>
              <select
                value={formData.productCategory}
                onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                title="Select product category"
                aria-label="Select product category"
                className={inputClasses}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Pricing Model</label>
              <select
                value={formData.pricingModel}
                onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                title="Select pricing model"
                aria-label="Select pricing model"
                className={inputClasses}
              >
                <option value="one_time">One-time</option>
                <option value="subscription">Subscription</option>
                <option value="usage_based">Usage-based</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              Price {formData.pricingModel === "subscription" ? "(per month)" : ""}
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              step="0.01"
              min="0"
              className={inputClasses}
              placeholder="Leave empty for 'Contact for pricing'"
            />
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={inputClasses}
              placeholder="Brief product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Product URL</label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className={inputClasses}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClasses}>Affiliate URL</label>
              <input
                type="url"
                value={formData.affiliateUrl}
                onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                className={inputClasses}
                placeholder="https://...?ref=..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-primary/50"
            />
            <label htmlFor="isFeatured" className="text-sm text-foreground">Featured Product</label>
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
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
