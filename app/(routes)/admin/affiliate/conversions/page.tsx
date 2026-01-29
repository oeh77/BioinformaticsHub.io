"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Undo2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface Conversion {
  id: string;
  partnerId: string;
  productId: string | null;
  orderId: string | null;
  transactionId: string | null;
  conversionType: string;
  saleAmount: number | null;
  commissionAmount: number;
  currency: string;
  conversionStatus: string;
  payoutStatus: string;
  convertedAt: string;
  notes: string | null;
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

interface Stats {
  totalSales: number;
  totalCommission: number;
  count: number;
}

const conversionTypeLabels: Record<string, string> = {
  sale: "Sale",
  lead: "Lead",
  signup: "Sign Up",
  trial: "Trial",
  download: "Download",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  approved: { bg: "bg-green-500/20", text: "text-green-400" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400" },
  reversed: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

const payoutStatusColors: Record<string, { bg: string; text: string }> = {
  unpaid: { bg: "bg-orange-500/20", text: "text-orange-400" },
  processing: { bg: "bg-blue-500/20", text: "text-blue-400" },
  paid: { bg: "bg-green-500/20", text: "text-green-400" },
};

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [payoutFilter, setPayoutFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);

  useEffect(() => {
    fetchConversions();
  }, [statusFilter, payoutFilter]);

  async function fetchConversions(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
        ...(payoutFilter && { payoutStatus: payoutFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/conversions?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch conversions");

      const data = await response.json();
      setConversions(data.conversions);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching conversions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(conversionId: string, action: "approve" | "reject" | "reverse") {
    try {
      setActionLoading(conversionId);
      const response = await fetch(`/api/admin/affiliate/conversions/${conversionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} conversion`);
      }

      // Refresh the list
      fetchConversions(pagination?.page || 1);
    } catch (error) {
      console.error(`Error ${action}ing conversion:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversions</h1>
          <p className="text-white/60">Review and manage affiliate conversions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-white/60 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">
            ${(stats?.totalSales || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Total Commission</span>
          </div>
          <p className="text-2xl font-bold">
            ${(stats?.totalCommission || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Pending Review</span>
          </div>
          <p className="text-2xl font-bold">
            {conversions.filter(c => c.conversionStatus === "pending").length}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Total Conversions</span>
          </div>
          <p className="text-2xl font-bold">{stats?.count || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filter by conversion status"
          aria-label="Filter by conversion status"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="reversed">Reversed</option>
        </select>
        <select
          value={payoutFilter}
          onChange={(e) => setPayoutFilter(e.target.value)}
          title="Filter by payout status"
          aria-label="Filter by payout status"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Payout Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Conversions Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Partner / Product
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Sale Amount
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Commission
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Payout
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
              ) : conversions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversions found</p>
                  </td>
                </tr>
              ) : (
                conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm">
                      {formatDate(conversion.convertedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{conversion.partner.companyName}</p>
                        {conversion.product && (
                          <p className="text-sm text-white/60">{conversion.product.productName}</p>
                        )}
                        {conversion.orderId && (
                          <p className="text-xs text-white/40 font-mono">#{conversion.orderId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {conversionTypeLabels[conversion.conversionType] || conversion.conversionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {conversion.saleAmount !== null
                        ? `$${conversion.saleAmount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      ${conversion.commissionAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          statusColors[conversion.conversionStatus]?.bg
                        } ${statusColors[conversion.conversionStatus]?.text}`}
                      >
                        {conversion.conversionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          payoutStatusColors[conversion.payoutStatus]?.bg
                        } ${payoutStatusColors[conversion.payoutStatus]?.text}`}
                      >
                        {conversion.payoutStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {conversion.conversionStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(conversion.id, "approve")}
                              disabled={actionLoading === conversion.id}
                              className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(conversion.id, "reject")}
                              disabled={actionLoading === conversion.id}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {conversion.conversionStatus === "approved" &&
                          conversion.payoutStatus !== "paid" && (
                            <button
                              onClick={() => handleAction(conversion.id, "reverse")}
                              disabled={actionLoading === conversion.id}
                              className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors disabled:opacity-50"
                              title="Reverse"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                          )}
                        <button
                          onClick={() => setSelectedConversion(conversion)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              {pagination.total} conversions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchConversions(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => fetchConversions(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversion Details Modal */}
      {selectedConversion && (
        <ConversionDetailsModal
          conversion={selectedConversion}
          onClose={() => setSelectedConversion(null)}
        />
      )}
    </div>
  );
}

// ConversionDetailsModal
function ConversionDetailsModal({
  conversion,
  onClose,
}: {
  conversion: Conversion;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Conversion Details</h2>
          <button
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Partner</label>
              <p className="font-medium">{conversion.partner.companyName}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Product</label>
              <p className="font-medium">{conversion.product?.productName || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Order ID</label>
              <p className="font-mono">{conversion.orderId || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Transaction ID</label>
              <p className="font-mono">{conversion.transactionId || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Type</label>
              <p>{conversionTypeLabels[conversion.conversionType]}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Sale Amount</label>
              <p className="font-medium">
                {conversion.saleAmount !== null
                  ? `${conversion.currency} ${conversion.saleAmount.toLocaleString()}`
                  : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Commission</label>
              <p className="font-medium text-emerald-400">
                ${conversion.commissionAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[conversion.conversionStatus]?.bg
                  } ${statusColors[conversion.conversionStatus]?.text}`}
                >
                  {conversion.conversionStatus}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Payout Status</label>
              <p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    payoutStatusColors[conversion.payoutStatus]?.bg
                  } ${payoutStatusColors[conversion.payoutStatus]?.text}`}
                >
                  {conversion.payoutStatus}
                </span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Converted At</label>
            <p>
              {new Date(conversion.convertedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {conversion.notes && (
            <div>
              <label className="text-sm text-muted-foreground">Notes</label>
              <p className="mt-1 p-3 bg-white/5 rounded-lg text-sm">{conversion.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
