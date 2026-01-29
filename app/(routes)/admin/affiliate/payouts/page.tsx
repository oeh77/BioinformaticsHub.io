"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Plus,
  CreditCard,
  Building2,
  X,
} from "lucide-react";

interface Payout {
  id: string;
  partnerId: string;
  totalCommission: number;
  totalSales: number;
  totalConversions: number;
  payoutPeriodStart: string;
  payoutPeriodEnd: string;
  payoutStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  partner: {
    id: string;
    companyName: string;
    contactEmail: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalPaid: number;
  totalPayouts: number;
  pendingAmount: number;
  pendingCount: number;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  processing: { bg: "bg-blue-500/20", text: "text-blue-400" },
  paid: { bg: "bg-green-500/20", text: "text-green-400" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400" },
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  async function fetchPayouts(page = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/affiliate/payouts?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch payouts");

      const data = await response.json();
      setPayouts(data.payouts);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayoutAction(payoutId: string, action: "complete" | "cancel") {
    try {
      setActionLoading(payoutId);
      const response = await fetch(`/api/admin/affiliate/payouts/${payoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} payout`);
      }

      fetchPayouts(pagination?.page || 1);
      setSelectedPayout(null);
    } catch (error) {
      console.error(`Error ${action}ing payout:`, error);
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
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-white/60">Manage affiliate commission payouts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Payout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            ${(stats?.pendingAmount || 0).toLocaleString()}
          </p>
          <p className="text-sm text-white/40">{stats?.pendingCount || 0} payouts</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${(stats?.totalPaid || 0).toLocaleString()}
          </p>
          <p className="text-sm text-white/40">{stats?.totalPayouts || 0} payouts</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Active Partners</span>
          </div>
          <p className="text-2xl font-bold">
            {new Set(payouts.map((p) => p.partnerId)).size}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-white/60 text-sm">Avg Payout</span>
          </div>
          <p className="text-2xl font-bold">
            ${stats?.totalPayouts 
              ? ((stats.totalPaid || 0) / stats.totalPayouts).toFixed(0) 
              : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filter by payout status"
          aria-label="Filter by payout status"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Payouts Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Partner
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Period
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Conversions
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/70">
                  Paid At
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
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payouts found</p>
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{payout.partner.companyName}</p>
                        <p className="text-sm text-white/60">{payout.partner.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(payout.payoutPeriodStart)} - {formatDate(payout.payoutPeriodEnd)}
                    </td>
                    <td className="px-6 py-4">{payout.totalConversions}</td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      ${payout.totalCommission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          statusColors[payout.payoutStatus]?.bg
                        } ${statusColors[payout.payoutStatus]?.text}`}
                      >
                        {payout.payoutStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {payout.paidAt ? formatDate(payout.paidAt) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payout.payoutStatus === "pending" && (
                          <button
                            onClick={() => handlePayoutAction(payout.id, "complete")}
                            disabled={actionLoading === payout.id}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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
              {pagination.total} payouts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPayouts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPayouts(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-white/5 rounded disabled:opacity-50 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <PayoutDetailsModal
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
          onAction={(action) => handlePayoutAction(selectedPayout.id, action)}
          loading={actionLoading === selectedPayout.id}
        />
      )}

      {/* Create Payout Modal */}
      {showCreateModal && (
        <CreatePayoutModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchPayouts();
          }}
        />
      )}
    </div>
  );
}

// Payout Details Modal
function PayoutDetailsModal({
  payout,
  onClose,
  onAction,
  loading,
}: {
  payout: Payout;
  onClose: () => void;
  onAction: (action: "complete" | "cancel") => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Payout Details</h2>
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
          <div className="text-center p-6 bg-muted/50 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Total Commission</p>
            <p className="text-4xl font-bold text-primary">
              ${payout.totalCommission.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Partner</label>
              <p className="font-medium">{payout.partner.companyName}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[payout.payoutStatus]?.bg
                  } ${statusColors[payout.payoutStatus]?.text}`}
                >
                  {payout.payoutStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Total Sales</label>
              <p className="font-medium">${payout.totalSales.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Conversions</label>
              <p className="font-medium">{payout.totalConversions}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Period</label>
            <p>
              {new Date(payout.payoutPeriodStart).toLocaleDateString()} -{" "}
              {new Date(payout.payoutPeriodEnd).toLocaleDateString()}
            </p>
          </div>

          {payout.transactionId && (
            <div>
              <label className="text-sm text-muted-foreground">Transaction ID</label>
              <p className="font-mono text-sm">{payout.transactionId}</p>
            </div>
          )}

          {payout.notes && (
            <div>
              <label className="text-sm text-muted-foreground">Notes</label>
              <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{payout.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-4">
          {payout.payoutStatus === "pending" && (
            <>
              <button
                onClick={() => onAction("cancel")}
                disabled={loading}
                className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel Payout
              </button>
              <button
                onClick={() => onAction("complete")}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                Mark as Paid
              </button>
            </>
          )}
          {payout.payoutStatus !== "pending" && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Payout Modal
function CreatePayoutModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [partners, setPartners] = useState<
    Array<{ id: string; companyName: string; unpaidAmount: number }>
  >([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPartners, setFetchingPartners] = useState(true);
  const [error, setError] = useState("");

  // Semantic Classes
  const inputClasses = "w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium mb-2 text-foreground";
  const modalClasses = "bg-card text-card-foreground rounded-xl border border-border w-full max-w-md shadow-2xl";

  useEffect(() => {
    fetchPartnersWithPendingPayouts();
  }, []);

  async function fetchPartnersWithPendingPayouts() {
    try {
      setFetchingPartners(true);
      const response = await fetch(
        "/api/admin/affiliate/partners?status=active&limit=100",
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        // TODO: Calculate actual unpaid amounts per partner
        setPartners(
          data.partners.map((p: { id: string; companyName: string }) => ({
            ...p,
            unpaidAmount: 0, // This should be calculated from conversions
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch partners", e);
    } finally {
      setFetchingPartners(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPartner) {
      setError("Please select a partner");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          partnerId: selectedPartner,
          paymentMethod,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create payout");
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
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create Payout</h2>
            <button
              onClick={onClose}
              title="Close modal"
              aria-label="Close modal"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Generate a payout for pending conversions
          </p>
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
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              disabled={fetchingPartners}
              title="Select partner for payout"
              aria-label="Select partner for payout"
              className={`${inputClasses} disabled:opacity-50`}
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
            <label className={labelClasses}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              title="Select payment method"
              aria-label="Select payment method"
              className={inputClasses}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="check">Check</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedPartner}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Creating..." : "Create Payout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
