'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight,
  Plus,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Filter,
  Search,
  Trash2,
  BarChart3
} from 'lucide-react';

interface AffiliateLink {
  id: string;
  shortCode: string;
  name: string | null;
  originalUrl: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  product: { name: string; url: string } | null;
  campaign: { name: string } | null;
  stats: {
    clicks: number;
    conversions: number;
    commission: number;
    conversionRate: number;
  };
}

interface Summary {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
}

export default function PartnerLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create link form state
  const [newLink, setNewLink] = useState({
    customUrl: '',
    name: '',
    productId: '',
    campaignId: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, [statusFilter]);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/partner/links?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch links');
      const data = await res.json();
      setLinks(data.links);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(shortCode: string, id: string) {
    const url = `${window.location.origin}/go/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function createLink() {
    if (!newLink.customUrl && !newLink.productId) {
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/partner/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customUrl: newLink.customUrl || undefined,
          name: newLink.name || undefined,
          productId: newLink.productId || undefined,
          campaignId: newLink.campaignId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create link');
      }

      setShowCreateModal(false);
      setNewLink({ customUrl: '', name: '', productId: '', campaignId: '' });
      fetchLinks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setCreating(false);
    }
  }

  // Filter links by search
  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.shortCode.toLowerCase().includes(query) ||
      link.name?.toLowerCase().includes(query) ||
      link.originalUrl.toLowerCase().includes(query) ||
      link.product?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/partner" className="hover:text-foreground">Partner Portal</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Links</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Link2 className="w-8 h-8 text-blue-400" />
                Affiliate Links
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your affiliate links
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Total Links</span>
              </div>
              <p className="text-2xl font-bold">{summary.totalLinks}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold">{summary.activeLinks}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointer className="w-4 h-4" />
                <span className="text-sm">Clicks</span>
              </div>
              <p className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Conversions</span>
              </div>
              <p className="text-2xl font-bold">{summary.totalConversions}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Commission</span>
              </div>
              <p className="text-2xl font-bold text-green-400">${summary.totalCommission.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass border border-white/20 bg-transparent focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {['all', 'active', 'paused', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
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

        {/* Links Table */}
        {loading ? (
          <div className="glass-card rounded-xl border border-white/10 p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl border border-white/10">
            <Link2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Links Found</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === 'all' 
                ? "Create your first affiliate link to start earning!" 
                : `No ${statusFilter} links found.`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left p-4 font-medium text-muted-foreground">Link</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Product/Campaign</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Clicks</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Conv.</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Commission</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          link.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <code className="text-primary font-mono">/go/{link.shortCode}</code>
                          {link.name && (
                            <p className="text-sm text-muted-foreground">{link.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {link.product && (
                        <span className="text-sm">{link.product.name}</span>
                      )}
                      {link.campaign && (
                        <span className="text-xs text-muted-foreground block">
                          📣 {link.campaign.name}
                        </span>
                      )}
                      {!link.product && !link.campaign && (
                        <span className="text-sm text-muted-foreground">Custom link</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">{link.stats.clicks.toLocaleString()}</td>
                    <td className="p-4 text-right font-medium">{link.stats.conversions}</td>
                    <td className="p-4 text-right">
                      <span className={link.stats.conversionRate > 2 ? 'text-green-400' : ''}>
                        {link.stats.conversionRate}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-green-400">
                      ${link.stats.commission.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(link.shortCode, link.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Visit original URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md m-4 p-6 rounded-2xl border border-white/20">
            <h2 className="text-xl font-bold mb-4">Create Affiliate Link</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/product"
                  value={newLink.customUrl}
                  onChange={(e) => setNewLink({ ...newLink, customUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-transparent focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Link Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Homepage Banner"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-transparent focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-lg glass border border-white/20 hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createLink}
                disabled={creating || !newLink.customUrl}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
