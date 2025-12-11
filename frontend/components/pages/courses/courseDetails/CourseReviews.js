"use client"
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import ReviewCard from "@/components/common/ReviewCard";
import RatingModal from "@/components/modals/RatingModal";
import { getCourseReviews } from "@/lib/apiCalls/reviews/getCourseReviews";

export default function CourseReviews({ course, isEnrolled }) {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const fetchedCourseId = useRef(null);

  useEffect(() => {
    if (course.id && course.id !== fetchedCourseId.current) {
      fetchedCourseId.current = course.id;
      fetchReviews();
    }
  }, [course.id]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await getCourseReviews(course.id);
      if (response.success) {
        const sortedReviews = (response.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReviews(sortedReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRatingSuccess = () => {
    fetchReviews();
  };

  return (
    <div
      id="reviews"
      className="bg-card rounded-xl border border-border shadow-sm p-6 lg:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Student Feedback</h2>
        {isEnrolled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRatingModal(true)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-foreground">
              {course.average_rating}
            </span>
            <div className="flex my-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(course.average_rating)
                      ? "fill-current"
                      : "text-muted fill-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Course Rating
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex text-yellow-400 w-16">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < stars ? "fill-current" : "text-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      <div className="space-y-6">
        {reviewsLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
        ) : (
          (showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {reviews.length > 3 && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-primary hover:text-primary/80"
          onClick={() => setShowAllReviews(!showAllReviews)}
        >
          {showAllReviews ? "Show Less" : "See More Reviews"}
        </Button>
      )}

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        courseId={course.id}
        courseName={course.title}
        onSubmitSuccess={handleRatingSuccess}
      />
    </div>
  );
}
