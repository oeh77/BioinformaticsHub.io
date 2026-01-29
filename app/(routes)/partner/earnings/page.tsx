'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  BarChart3,
  ArrowUpRight,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface EarningsSummary {
  pendingEarnings: number;
  approvedEarnings: number;
  totalEarnings: number;
  paidOut: number;
  totalSales: number;
  availableForPayout: number;
  minimumPayout: number;
  canRequestPayout: boolean;
  conversionsCount: number;
}

interface PaymentSettings {
  method: string | null;
  hasPaymentDetails: boolean;
  threshold: number;
}

interface ChartData {
  date: string;
  revenue: number;
  commission: number;
  conversions: number;
}

interface RecentConversion {
  id: string;
  saleAmount: number;
  commissionAmount: number;
  status: string;
  date: string;
}

interface PayoutHistory {
  id: string;
  amount: number;
  status: string;
  method: string;
  requestedAt: string;
  paidAt: string | null;
  transactionRef: string | null;
}

export default function PartnerEarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  async function fetchEarnings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/partner/earnings?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch earnings');
      const data = await res.json();
      setSummary(data.summary);
      setPaymentSettings(data.paymentSettings);
      setChartData(data.earningsChart);
      setRecentConversions(data.recentConversions);
      setPayoutHistory(data.payoutHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-8">
        <div className="container mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/partner" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/partner" className="hover:text-foreground">Partner Portal</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Earnings</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-400" />
                Your Earnings
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your commissions and payout history
              </p>
            </div>
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="text-3xl font-bold">${summary.pendingEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Approved</span>
              </div>
              <p className="text-3xl font-bold text-green-400">${summary.approvedEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Paid Out</span>
              </div>
              <p className="text-3xl font-bold">${summary.paidOut.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total withdrawn</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Total Sales</span>
              </div>
              <p className="text-3xl font-bold">${summary.totalSales.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.conversionsCount} conversions</p>
            </div>
          </div>
        )}

        {/* Payout Status Card */}
        {summary && paymentSettings && (
          <div className={`glass-card p-6 rounded-xl border mb-8 ${
            summary.canRequestPayout 
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payout Status
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {summary.canRequestPayout 
                    ? 'You have reached the minimum payout threshold!'
                    : `Earn $${(summary.minimumPayout - summary.availableForPayout).toFixed(2)} more to reach payout threshold ($${summary.minimumPayout})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">${summary.availableForPayout.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Available for payout</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min((summary.availableForPayout / summary.minimumPayout) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>$0</span>
                <span>Minimum: ${summary.minimumPayout}</span>
              </div>
            </div>

            {!paymentSettings.hasPaymentDetails && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  Please set up your payment details to receive payouts.
                </span>
                <Link href="/partner/settings" className="ml-auto text-sm text-primary hover:underline">
                  Set up now →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Earnings Chart */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              Earnings Over Time
            </h3>
            {chartData.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {chartData.slice(-30).map((day, i) => {
                  const maxCommission = Math.max(...chartData.map(d => d.commission));
                  const height = maxCommission > 0 ? (day.commission / maxCommission) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-green-500/50 to-green-500 rounded-t group relative"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: $${day.commission.toFixed(2)}`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-white/20 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                        <div className="font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                        <div className="text-green-400">${day.commission.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No earnings data for this period
              </div>
            )}
          </div>

          {/* Recent Conversions */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              Recent Conversions
            </h3>
            {recentConversions.length > 0 ? (
              <div className="space-y-3">
                {recentConversions.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">${conv.saleAmount?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-400">
                        +${conv.commissionAmount?.toFixed(2) || '0.00'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(conv.status)}`}>
                        {conv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No conversions yet
              </div>
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="glass-card p-6 rounded-xl border border-white/10 mt-8">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            Payout History
          </h3>
          {payoutHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground">Method</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id} className="border-b border-white/5">
                      <td className="py-3">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-medium text-green-400">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="py-3 capitalize">{payout.method}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {payout.transactionRef || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No payouts yet. Keep earning to request your first payout!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
