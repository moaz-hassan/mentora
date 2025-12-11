"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createRating } from "@/lib/apiCalls/ratings/createRating.apiCall";
import { toast } from "sonner"; // Using toast for notifications

export default function RatingModal({ isOpen, onClose, courseId, courseName, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const maxChars = 1000;
  const minChars = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars");
      return;
    }

    if (reviewText.trim().length < minChars) {
      setError(`Review must be at least ${minChars} characters`);
      return;
    }

    if (reviewText.length > maxChars) {
      setError(`Review must be less than ${maxChars} characters`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await createRating({
        courseId,
        rating,
        reviewText: reviewText.trim(),
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Success
      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReviewText("");
      setError(null);

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      // Create a clean close handler
      if (!rating && !reviewText) {
         // If clean, just close
      }
      onClose();
    }
  };
  
  // Handle Dialog open change
  const handleOpenChange = (open) => {
    if (!open) {
      handleClose();
    }
  };

  const displayRating = hoveredRating || rating;
  const charCount = reviewText.length;
  const isValid = rating >= 1 && rating <= 5 && reviewText.trim().length >= minChars && charCount <= maxChars;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Rate this course</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {courseName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                  aria-label={`Rate ${star} stars`}
                  disabled={submitting}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted stroke-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-foreground animate-in fade-in" aria-live="polite">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label htmlFor="review-text" className="block text-sm font-semibold text-foreground">
              Your Review *
            </label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this course. What did you learn? Would you recommend it to others?"
              rows={5}
              className="resize-none"
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Minimum {minChars} characters
              </span>
              <span
                className={`text-xs font-medium ${
                  charCount > maxChars ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {charCount} / {maxChars}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
