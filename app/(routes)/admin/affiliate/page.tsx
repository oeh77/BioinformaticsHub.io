"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  Link as LinkIcon,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";

interface OverviewStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  conversionRate: number;
}

interface TopPartner {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface RecentConversion {
  id: string;
  partner: string;
  product?: string;
  saleAmount: number | null;
  commissionAmount: number;
  status: string;
  convertedAt: string;
}

interface Analytics {
  overview: OverviewStats;
  topPartners: TopPartner[];
  recentConversions: RecentConversion[];
}

export default function AffiliateDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/affiliate/analytics?period=${period}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Affiliate Marketing</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-xl animate-pulse border border-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" aria-live="assertive" role="alert">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = analytics?.overview;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Marketing</h1>
          <p className="text-white/60 mt-1">
            Manage partners, products, and track performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            title="Select time period for analytics"
            aria-label="Select time period"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={12.5}
          color="emerald"
        />
        <StatCard
          title="Total Commission"
          value={`$${(stats?.totalCommission || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={8.2}
          color="blue"
        />
        <StatCard
          title="Total Clicks"
          value={(stats?.totalClicks || 0).toLocaleString()}
          icon={<MousePointerClick className="w-5 h-5" />}
          trend={15.3}
          color="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={<ArrowUpRight className="w-5 h-5" />}
          trend={2.1}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white/80">Pending Commission</h3>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              Awaiting Payout
            </span>
          </div>
          <p className="text-2xl font-bold">
            ${(stats?.pendingCommission || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white/80">Paid Commission</h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              All Time
            </span>
          </div>
          <p className="text-2xl font-bold">
            ${(stats?.paidCommission || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white/80">Conversions</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              This Period
            </span>
          </div>
          <p className="text-2xl font-bold">
            {(stats?.totalConversions || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          href="/admin/affiliate/partners"
          icon={<Users className="w-6 h-6" />}
          title="Partners"
          description="Manage affiliate partners"
        />
        <QuickActionCard
          href="/admin/affiliate/products"
          icon={<Package className="w-6 h-6" />}
          title="Products"
          description="Product catalog"
        />
        <QuickActionCard
          href="/admin/affiliate/links"
          icon={<LinkIcon className="w-6 h-6" />}
          title="Links"
          description="Generate & track links"
        />
        <QuickActionCard
          href="/admin/affiliate/conversions"
          icon={<DollarSign className="w-6 h-6" />}
          title="Conversions"
          description="Review conversions"
        />
      </div>
{/* Floating Create New Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/admin/affiliate/partners?action=create">
          <button className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:scale-105" aria-label="Create New Partner">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      </div>

      {/* Top Partners & Recent Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Partners */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Top Partners</h3>
            <Link
              href="/admin/affiliate/partners"
              className="text-primary text-sm hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {analytics?.topPartners.slice(0, 5).map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-white/60">
                    {partner.conversions} conversions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-400">
                    ${partner.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60">
                    ${partner.commission.toFixed(2)} earned
                  </p>
                </div>
              </div>
            ))}
            {(!analytics?.topPartners || analytics.topPartners.length === 0) && (
              <p className="text-center text-white/60 py-8">
                No partner data yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Conversions</h3>
            <Link
              href="/admin/affiliate/conversions"
              className="text-primary text-sm hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {analytics?.recentConversions.slice(0, 5).map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium">{conversion.partner}</p>
                  <p className="text-sm text-white/60">
                    {conversion.product || "Direct"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-400">
                    ${(conversion.saleAmount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={conversion.status} />
                </div>
              </div>
            ))}
            {(!analytics?.recentConversions ||
              analytics.recentConversions.length === 0) && (
              <p className="text-center text-white/60 py-8">
                No conversions yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  color: "emerald" | "blue" | "purple" | "orange";
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div
          className={`flex items-center gap-1 text-sm ${
            trend >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-white/60">{title}</p>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-white/60">{description}</p>
        </div>
      </div>
    </Link>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    reversed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {status}
    </span>
  );
}
