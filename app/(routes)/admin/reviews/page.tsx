"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Eye,
  MessageSquare,
  User,
  Calendar
} from "lucide-react";
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

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  tool: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [previewReview, setPreviewReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/admin/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reviewId: string, status: string) {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  }

  async function deleteReview() {
    if (!reviewToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/reviews/${reviewToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }

  const filteredReviews = reviews.filter((review) =>
    review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and moderate user reviews for tools</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
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
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          review.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : review.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {review.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {review.user.name || review.user.email}
                      </span>
                      <span>for</span>
                      <span className="font-medium text-primary">{review.tool.name}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewReview(review)}
                      title="View full review"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {review.status !== "approved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(review.id, "approved")}
                        title="Approve review"
                        className="text-green-500 hover:text-green-400"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(review.id, "rejected")}
                        title="Reject review"
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setReviewToDelete(review);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete review"
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
      <Dialog open={!!previewReview} onOpenChange={() => setPreviewReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {previewReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {renderStars(previewReview.rating)}
                <span className="text-sm text-muted-foreground">
                  {previewReview.rating}/5
                </span>
              </div>
              {previewReview.title && (
                <h4 className="font-semibold text-lg">{previewReview.title}</h4>
              )}
              <p className="text-muted-foreground">{previewReview.content}</p>
              <div className="pt-4 border-t border-white/10 text-sm text-muted-foreground">
                <p>
                  <strong>Tool:</strong> {previewReview.tool.name}
                </p>
                <p>
                  <strong>User:</strong> {previewReview.user.name || previewReview.user.email}
                </p>
                <p>
                  <strong>Posted:</strong>{" "}
                  {new Date(previewReview.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteReview}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
