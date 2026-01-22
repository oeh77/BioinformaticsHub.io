"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, CheckSquare, Square, MinusSquare } from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  deleteEndpoint: string;
  itemName?: string;
}

export function BulkActions({
  selectedIds,
  totalItems,
  onSelectAll,
  onDeselectAll,
  deleteEndpoint,
  itemName = "item",
}: BulkActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const allSelected = selectedIds.length === totalItems && totalItems > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalItems;

  const handleBulkDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const deletePromises = selectedIds.map((id) =>
        fetch(`${deleteEndpoint}/${id}`, { method: "DELETE" })
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.ok).length;

      if (failed > 0) {
        setError(`Failed to delete ${failed} ${itemName}(s)`);
      }

      onDeselectAll();
      router.refresh();
      setShowConfirm(false);
    } catch {
      setError("Failed to delete items");
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return (
      <button
        type="button"
        onClick={onSelectAll}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Select all items"
        aria-label="Select all items"
      >
        <Square className="w-4 h-4" />
        <span>Select all</span>
      </button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          title={allSelected ? "Deselect all" : "Select all"}
          aria-label={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : someSelected ? (
            <MinusSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        <span className="text-sm font-medium">
          {selectedIds.length} {itemName}
          {selectedIds.length !== 1 ? "s" : ""} selected
        </span>

        <div className="flex-1" />

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowConfirm(true)}
          className="rounded-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </Button>

        <button
          type="button"
          onClick={onDeselectAll}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Bulk Delete</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete {selectedIds.length} {itemName}
              {selectedIds.length !== 1 ? "s" : ""}? This action cannot be undone.
            </p>
            {error && (
              <p className="text-red-400 text-sm mb-4 p-3 rounded bg-red-500/10">
                {error}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setError("");
                }}
                disabled={loading}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={loading}
                className="rounded-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedIds.length}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
