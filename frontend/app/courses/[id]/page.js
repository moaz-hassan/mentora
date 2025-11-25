"use client";

import { useState, useEffect } from "react";
import getCourseById from "@/lib/apiCalls/courses/getCourseById";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  Award,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
  Globe,
  Smartphone,
  Download,
  Infinity,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CoursePageSkeleton from "@/components/skeleton/CoursePageSkeleton";
import CourseNotFound from "@/components/fallback/CourseNotFound";
import PreviewLessonModal from "@/components/PreviewLessonModal";
import RatingModal from "@/components/RatingModal";
import ReviewCard from "@/components/ReviewCard";
import { getCourseReviews } from "@/lib/apiCalls/reviews/getCourseReviews";
import { checkEnrollment } from "@/lib/apiCalls/enrollments/checkEnrollment";
import {
  formatDuration,
  calculateTotalLessons,
  calculateTotalDuration,
  formatPrice,
  getActiveDiscount,
  getInstructorName,
  getInstructorInitials,
  formatLessonDuration,
} from "@/lib/courseUtils";
import Link from "next/link";

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    lesson: null,
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchCoursePreview();
    fetchReviews();
    checkUserEnrollment();
  }, [params.id]);

  const fetchCoursePreview = async () => {
    try {
      const response = await getCourseById(params.id);
      if (response.success) {
        setCourse(response.data);
        if (response.data.Chapters?.length > 0) {
          setExpandedChapters({ [response.data.Chapters[0].id]: true });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await getCourseReviews(params.id);
      if (response.success) {
        // Sort reviews by created_at descending (newest first)
        const sortedReviews = (response.data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
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

  const checkUserEnrollment = async () => {
    try {
      const enrolled = await checkEnrollment(params.id);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setIsEnrolled(false);
    }
  };

  const handleRatingSuccess = () => {
    // Refresh reviews after successful rating submission
    fetchReviews();
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const openPreviewModal = (lesson) => {
    setPreviewModal({
      isOpen: true,
      lesson: lesson,
    });
  };

  const handleIntroClick = () => {
    if (!course.intro_video_public_id) return;
    
    const introLesson = {
      title: "Course Introduction",
      lesson_type: "video",
      video_public_id: course.intro_video_public_id,
      is_preview: true,
    };

    setPreviewModal({
      isOpen: true,
      lesson: introLesson,
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      lesson: null,
    });
  };

  const handleEnroll = () => {
    // Navigate to enrollment/payment page
    router.push(`/courses/${params.id}/enroll`);
  };

  if (loading) return <CoursePageSkeleton />;
  if (!course) return <CourseNotFound />;

  const totalLessons = calculateTotalLessons(course.Chapters);
  const totalDuration = calculateTotalDuration(course.Chapters);
  const activeDiscount = getActiveDiscount(course);
  const instructorName = getInstructorName(course.User);
  const instructorInitials = getInstructorInitials(course.User);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Link href="/" className="hover:text-white">Home</Link>
                <span>/</span>
                <Link href="/courses" className="hover:text-white">{course.category || "Courses"}</Link>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              {/* Badge */}
              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 mb-4">
                {course.category || "WEB DESIGN MASTERCLASS"}
              </Badge>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {course.User?.Profile?.profile_picture_url ? (
                      <img 
                        src={course.User.Profile.profile_picture_url} 
                        alt={instructorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{instructorInitials}</span>
                    )}
                  </div>
                  <span>{instructorName}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {new Date(course.updated_at || course.created_at).toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollments_count || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Course Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Course Curriculum */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Curriculum</h2>
              <p className="text-sm text-gray-600 mb-6">
                {course.Chapters?.length || 0} sections • {totalLessons} lectures • {formatDuration(totalDuration)} total length
              </p>

              <div className="space-y-2">
                {course.Chapters?.map((chapter, chapterIndex) => {
                  const chapterLessons = chapter.Lessons?.length || 0;
                  const chapterDuration = chapter.Lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
                  
                  return (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        aria-expanded={expandedChapters[chapter.id]}
                        aria-label={`${expandedChapters[chapter.id] ? 'Collapse' : 'Expand'} section ${chapterIndex + 1}: ${chapter.title}`}
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          {expandedChapters[chapter.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Section {chapterIndex + 1}: {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {chapterLessons} lectures • {formatLessonDuration(chapterDuration)}
                            </p>
                          </div>
                        </div>
                      </button>

                      {expandedChapters[chapter.id] && (
                        <div className="border-t border-gray-200">
                          {chapter.Lessons?.map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => lesson.is_preview && openPreviewModal(lesson)}
                              className={`flex items-center justify-between py-3 px-6 border-b border-gray-100 last:border-b-0 ${
                                lesson.is_preview 
                                  ? "hover:bg-blue-50 cursor-pointer" 
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <PlayCircle className={`w-4 h-4 flex-shrink-0 ${lesson.is_preview ? "text-blue-600" : "text-gray-400"}`} />
                                <span className="text-sm text-gray-700">{lesson.title}</span>
                                {lesson.is_preview && (
                                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatLessonDuration(lesson.duration || 0)}
                              </span>
                            </div>
                          ))}
                          
                          {chapter.Lessons?.some(l => l.LessonMaterials?.length > 0) && (
                            <div className="px-6 py-3 bg-gray-50">
                              <p className="text-xs text-gray-600 flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                Includes downloadable resources
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About the Instructor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Instructor</h2>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {course.User?.Profile?.profile_picture_url ? (
                    <img 
                      src={course.User.Profile.profile_picture_url} 
                      alt={instructorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-600">{instructorInitials}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{instructorName}</h3>
                  <p className="text-sm text-blue-600 mb-3">
                    {course.User?.Profile?.headline || "Senior Web Developer & UI/UX Expert"}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">4.9</span>
                      <span>Instructor Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>25,123 Reviews</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>156,456 Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      <span>12 Courses</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {course.User?.Profile?.bio || 
                  "With over a decade of experience in the tech industry, John has helped countless students and professionals build beautiful, functional, and user-centric web applications. His passion is breaking down complex topics into easy-to-understand concepts."}
              </p>
            </div>

            {/* Student Feedback */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Student Feedback</h2>
                {isEnrolled && (
                  <Button
                    onClick={() => setShowRatingModal(true)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Add Rating
                  </Button>
                )}
              </div>

              {/* Reviews */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <button 
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full mt-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      aria-expanded={showAllReviews}
                      aria-label={showAllReviews ? "Show less reviews" : `Show all ${reviews.length} reviews`}
                    >
                      {showAllReviews ? "Show less reviews" : `Show all ${reviews.length} reviews`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sample related courses - you'll fetch these from API */}
                {[1, 2].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        Related Course Title {i}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">Instructor Name</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold">4.5</span>
                          <span className="text-sm text-gray-500">(1.2k)</span>
                        </div>
                        <span className="font-bold text-gray-900">$49.99</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                {/* Video Preview */}
                <button 
                  className="relative aspect-video bg-gray-900 cursor-pointer group w-full"
                  onClick={handleIntroClick}
                  aria-label="Play course introduction video"
                >
                  <img
                    src={course.thumbnail_url || "https://via.placeholder.com/400x225"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                      <Play className="w-9 h-9 text-gray-900 fill-gray-900 ml-1" aria-hidden="true" />
                    </div>
                  </div>
                </button>

                <div className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    {activeDiscount ? (
                      <div>
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(activeDiscount.discountedPrice)}
                          </span>
                          <span className="text-xl text-gray-400 line-through">
                            {formatPrice(activeDiscount.originalPrice)}
                          </span>
                        </div>
                        <Badge className="bg-red-100 text-red-700 text-xs font-semibold">
                          {activeDiscount.type === "percentage"
                            ? `${activeDiscount.value}% OFF`
                            : `Save ${formatPrice(activeDiscount.value)}`}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(course.price)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleEnroll}
                      size="lg" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-base"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={handleEnroll}
                      size="lg" 
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 font-semibold py-6 text-base hover:bg-gray-50"
                    >
                      Enroll Now
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-600 mb-6">
                    30-Day Money-Back Guarantee
                  </p>

                  {/* Course Includes */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      This course includes:
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <PlayCircle className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>{formatDuration(totalDuration)} on-demand video</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <FileText className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>10 downloadable resources</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Infinity className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Smartphone className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>Access on mobile and TV</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Award className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreviewLessonModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        lesson={previewModal.lesson}
      />

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        courseId={params.id}
        courseName={course?.title || ""}
        onSubmitSuccess={handleRatingSuccess}
      />
    </div>
  );
}
