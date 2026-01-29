"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewSectionProps {
  toolId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewChange?: () => void;
}

export function ReviewSection({
  toolId,
  reviews: initialReviews,
  averageRating: initialAverage,
  totalReviews: initialTotal,
  onReviewChange,
}: ReviewSectionProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [totalReviews, setTotalReviews] = useState(initialTotal);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userReview = reviews.find(
    (r) => r.user.id === (session?.user as { id?: string })?.id
  );

  const handleSubmit = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, rating, content }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await res.json();

      if (userReview) {
        setReviews((prev) =>
          prev.map((r) => (r.id === userReview.id ? newReview : r))
        );
      } else {
        setReviews((prev) => [newReview, ...prev]);
        setTotalReviews((prev) => prev + 1);
      }

      // Recalculate average
      const newAvg =
        (averageRating * totalReviews + rating - (userReview?.rating || 0)) /
        (userReview ? totalReviews : totalReviews + 1);
      setAverageRating(Math.round(newAvg * 10) / 10);

      setRating(0);
      setContent("");
      onReviewChange?.();

      toast({
        title: userReview ? "Review updated" : "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete review");
      }

      const deleted = reviews.find((r) => r.id === reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotalReviews((prev) => prev - 1);

      if (deleted && totalReviews > 1) {
        const newAvg =
          (averageRating * totalReviews - deleted.rating) / (totalReviews - 1);
        setAverageRating(Math.round(newAvg * 10) / 10);
      } else {
        setAverageRating(0);
      }

      onReviewChange?.();

      toast({
        title: "Review deleted",
        description: "Your review has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-500">
            {averageRating || "—"}
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>
        <div className="flex-1 text-sm text-muted-foreground">
          See what other bioinformaticians think about this tool.
        </div>
      </div>

      {/* Write Review */}
      {status === "authenticated" && (
        <div className="p-4 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h4 className="font-semibold">
            {userReview ? "Update your review" : "Write a review"}
          </h4>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 && ["Poor", "Fair", "Good", "Great", "Excellent"][rating - 1]}
            </span>
          </div>

          <Textarea
            placeholder="Share your experience with this tool..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {userReview ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      )}

      {status === "unauthenticated" && (
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 text-center">
          <p className="text-muted-foreground">
            Sign in to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-xl border border-border/50 bg-card/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {review.user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {review.user.name || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {review.user.id === (session?.user as { id?: string })?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(review.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete review"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {review.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
