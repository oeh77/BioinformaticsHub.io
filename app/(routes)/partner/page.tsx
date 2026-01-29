/**
 * Partner Portal - Dashboard Page
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  LogOut,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from "lucide-react";

interface DashboardData {
  partner: {
    id: string;
    companyName: string;
    commissionRate: number;
    commissionType: string;
    contractStartDate: string | null;
    contractEndDate: string | null;
  };
  overview: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    conversionRate: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    clicks: number;
    conversions: number;
  }>;
  recentConversions: Array<{
    id: string;
    product: string | null;
    orderId: string | null;
    saleAmount: number | null;
    commissionAmount: number;
    status: string;
    payoutStatus: string;
    convertedAt: string;
  }>;
  period: string;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/affiliate/partner/dashboard?period=${period}`,
        { credentials: "include" }
      );

      if (response.status === 401) {
        router.push("/partner/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/affiliate/partner/auth", {
      method: "DELETE",
      credentials: "include",
    });
    router.push("/partner/login");
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    reversed: "bg-gray-500/20 text-gray-400",
  };

  const payoutColors: Record<string, string> = {
    unpaid: "bg-orange-500/20 text-orange-400",
    processing: "bg-blue-500/20 text-blue-400",
    paid: "bg-green-500/20 text-green-400",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BioinformaticsHub
              </h1>
            </Link>
            <span className="text-white/40">|</span>
            <span className="text-white/60">Partner Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Building2 className="w-5 h-5" />
              {dashboard.partner.companyName}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-white/60">
              Welcome back! Here&apos;s your performance overview.
            </p>
          </div>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clicks"
            value={dashboard.overview.totalClicks.toLocaleString()}
            icon={<MousePointerClick className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Conversions"
            value={dashboard.overview.totalConversions.toLocaleString()}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`$${dashboard.overview.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Conversion Rate"
            value={`${dashboard.overview.conversionRate}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Commission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-white/60">Total Commission</span>
            </div>
            <p className="text-3xl font-bold">
              ${dashboard.overview.totalCommission.toLocaleString()}
            </p>
            <p className="text-sm text-white/40 mt-1">
              {dashboard.partner.commissionRate}% {dashboard.partner.commissionType}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60">Pending Payout</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              ${dashboard.overview.pendingCommission.toLocaleString()}
            </p>
            <p className="text-sm text-white/40 mt-1">Awaiting processing</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white/60">Total Paid</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${dashboard.overview.paidCommission.toLocaleString()}
            </p>
            <p className="text-sm text-white/40 mt-1">All time payouts</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Products
            </h3>
            <div className="space-y-3">
              {dashboard.topProducts.length > 0 ? (
                dashboard.topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <span className="font-medium">{product.name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/60">
                        {product.clicks} clicks
                      </span>
                      <span className="text-emerald-400">
                        {product.conversions} sales
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/60 py-8">
                  No product data yet
                </p>
              )}
            </div>
          </div>

          {/* Recent Conversions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Recent Conversions
            </h3>
            <div className="space-y-3">
              {dashboard.recentConversions.length > 0 ? (
                dashboard.recentConversions.slice(0, 5).map((conversion) => (
                  <div
                    key={conversion.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {conversion.product || "Direct"}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(conversion.convertedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-400">
                        ${conversion.commissionAmount.toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          statusColors[conversion.status]
                        }`}
                      >
                        {conversion.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/60 py-8">
                  No conversions yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:support@bioinformaticshub.io"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Contact Support
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/affiliate/disclosure"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Affiliate Policy
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "emerald" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm text-white/60">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
