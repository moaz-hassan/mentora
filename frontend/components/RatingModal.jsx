"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          rating: rating,
          review_text: reviewText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to submit review');
      }

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
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setReviewText("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayRating = hoveredRating || rating;
  const charCount = reviewText.length;
  const isValid = rating >= 1 && rating <= 5 && reviewText.trim().length >= minChars && charCount <= maxChars;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 id="rating-modal-title" className="text-xl font-bold text-gray-900">Rate this course</h2>
            <p className="text-sm text-gray-600 mt-1">{courseName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
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
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700" aria-live="polite">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label htmlFor="review-text" className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review *
            </label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this course. What did you learn? Would you recommend it to others?"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
              disabled={submitting}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                Minimum {minChars} characters
              </span>
              <span
                className={`text-xs font-medium ${
                  charCount > maxChars ? "text-red-600" : "text-gray-500"
                }`}
              >
                {charCount} / {maxChars}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              variant="outline"
              className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
