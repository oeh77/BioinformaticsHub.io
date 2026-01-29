"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Check, 
  X, 
  Trash2, 
  Eye,
  Lightbulb,
  User,
  Calendar,
  ExternalLink,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ToolSuggestion {
  id: string;
  name: string;
  website: string | null;
  description: string;
  category: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<ToolSuggestion | null>(null);
  const [previewSuggestion, setPreviewSuggestion] = useState<ToolSuggestion | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchSuggestions();
  }, [statusFilter]);

  async function fetchSuggestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/admin/suggestions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(suggestionId: string, status: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/suggestions/${suggestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (response.ok) {
        setPreviewSuggestion(null);
        setAdminNotes("");
        fetchSuggestions();
      }
    } catch (error) {
      console.error("Error updating suggestion:", error);
    }
  }

  async function deleteSuggestion() {
    if (!suggestionToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/suggestions/${suggestionToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        setSuggestionToDelete(null);
        fetchSuggestions();
      }
    } catch (error) {
      console.error("Error deleting suggestion:", error);
    }
  }

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tool Suggestions</h1>
          <p className="text-muted-foreground mt-1">Review and manage user-submitted tool suggestions</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading suggestions...</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No suggestions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{suggestion.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            suggestion.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : suggestion.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {suggestion.status}
                        </span>
                        {suggestion.category && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/50">
                            {suggestion.category}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {suggestion.user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {suggestion.user.name || suggestion.user.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </span>
                        {suggestion.website && (
                          <a
                            href={suggestion.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewSuggestion(suggestion)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {suggestion.status === "approved" && (
                      <Link href={`/admin/tools/new?from_suggestion=${suggestion.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Create tool from suggestion"
                          className="text-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {suggestion.status !== "approved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(suggestion.id, "approved")}
                        title="Approve suggestion"
                        className="text-green-500 hover:text-green-400"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {suggestion.status !== "rejected" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(suggestion.id, "rejected")}
                        title="Reject suggestion"
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSuggestionToDelete(suggestion);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete suggestion"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewSuggestion} onOpenChange={() => setPreviewSuggestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggestion Details</DialogTitle>
          </DialogHeader>
          {previewSuggestion && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{previewSuggestion.name}</h4>
                {previewSuggestion.category && (
                  <span className="text-sm text-muted-foreground">Category: {previewSuggestion.category}</span>
                )}
              </div>
              <p className="text-muted-foreground">{previewSuggestion.description}</p>
              {previewSuggestion.website && (
                <a
                  href={previewSuggestion.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {previewSuggestion.website}
                </a>
              )}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this suggestion..."
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-white/10 text-sm resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => updateStatus(previewSuggestion.id, "rejected", adminNotes)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updateStatus(previewSuggestion.id, "approved", adminNotes)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Suggestion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{suggestionToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteSuggestion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
