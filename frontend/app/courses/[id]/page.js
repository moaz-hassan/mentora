"use client";

import { useState, useEffect } from "react";
import getCourseById from "@/lib/apiCalls/courses/getCourseById";
import getInstructorStats from "@/lib/apiCalls/instructor/getInstructorStats";
import getRelatedCourses from "@/lib/apiCalls/courses/getRelatedCourses";
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
  Infinity,
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
} from "@/lib/utils/courseUtils";
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
  const [instructorStats, setInstructorStats] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);

  useEffect(() => {
    fetchCoursePreview();
    fetchReviews();
    checkUserEnrollment();
  }, [params.id]);

  const fetchInstructorStats = async (instructorId) => {
    try {
      const response = await getInstructorStats(instructorId);
      if (response.success) {
        setInstructorStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
    }
  };

  const fetchRelatedCourses = async (courseId, category) => {
    try {
      const response = await getRelatedCourses(courseId, category, 4);
      if (response.success) {
        setRelatedCourses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching related courses:", error);
    }
  };

  const fetchCoursePreview = async () => {
    try {
      const response = await getCourseById(params.id);
      if (response.success) {
        setCourse(response.data);
        if (response.data.Chapters?.length > 0) {
          setExpandedChapters({ [response.data.Chapters[0].id]: true });
        }
        if (response.data.Instructor?.id) {
          fetchInstructorStats(response.data.Instructor.id);
        }
        fetchRelatedCourses(params.id);
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
    router.push(`/courses/${params.id}/enroll`);
  };

  if (loading) return <CoursePageSkeleton />;
  if (!course) return <CourseNotFound />;

  const totalLessons = calculateTotalLessons(course.Chapters);
  const totalDuration = calculateTotalDuration(course.Chapters);
  const activeDiscount = getActiveDiscount(course);
  const instructorName = getInstructorName(course.Instructor);
  const instructorInitials = getInstructorInitials(course.Instructor);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Absolute Dark Background for Header Area */}
      <div className="absolute top-0 left-0 w-full h-[550px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 z-0" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Flex Layout: Left Content + Right Sticky Card */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* === LEFT COLUMN === */}
          <div className="flex-1 min-w-0">
            
            {/* 1. Header Info Section (White Text on Dark BG) */}
            <div className="mb-10 text-white">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/courses" className="hover:text-white transition-colors">
                  {course.category_name || "Courses"}
                </Link>
                <span>/</span>
                <span className="text-gray-300 truncate max-w-[200px]">{course.title}</span>
              </nav>

              {/* Title & Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                 <Badge className="bg-blue-600 border-none text-white hover:bg-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  {course.category_name || "COURSE"}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {course.title}
                </h1>
              </div>

              {/* Description (Smaller Size) */}
              <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                {course.average_rating ? (
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <span className="text-lg">{course.average_rating}</span>
                    <div className="flex">
                       {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(course.average_rating) ? "fill-current" : "text-gray-600 fill-gray-600"}`} />
                       ))}
                    </div>
                    <Link href="#reviews" className="text-blue-300 hover:text-blue-200 underline text-xs font-normal ml-1">
                      ({course.total_reviews?.toLocaleString() || 0} reviews)
                    </Link>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">No ratings yet</span>
                )}
                
                <span className="text-gray-500">|</span>
                
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{course.enrollments_count?.toLocaleString() || 0} students</span>
                </div>
                
                <span className="text-gray-500">|</span>
                
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Last updated {new Date(course.updated_at || course.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>

              {/* Instructor Mini Profile */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center overflow-hidden ring-2 ring-white/10">
                   {course.Instructor?.Profile?.avatar_url ? (
                      <img src={course.Instructor.Profile.avatar_url} alt={instructorName} className="w-full h-full object-cover" />
                   ) : (
                      <span className="font-bold">{instructorInitials}</span>
                   )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Created by</p>
                  <p className="font-medium text-white hover:text-blue-300 cursor-pointer">{instructorName}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-4 text-gray-300">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-xs">English</span>
                </div>
              </div>
            </div>

            {/* 2. Body Content (Curriculum, Instructor, Reviews) */}
            <div className="space-y-8">
              {/* Curriculum */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <span className="font-medium text-gray-900">{course.Chapters?.length || 0} sections</span> • 
                  <span className="font-medium text-gray-900">{totalLessons} lectures</span> • 
                  <span className="font-medium text-gray-900">{formatDuration(totalDuration)} total length</span>
                </div>
                
                <div className="space-y-3">
                  {course.Chapters?.map((chapter, idx) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {expandedChapters[chapter.id] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          <span className="font-semibold text-gray-900 text-sm md:text-base">Section {idx + 1}: {chapter.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 hidden sm:block">{chapter.Lessons?.length || 0} lectures</span>
                      </button>
                      
                      {expandedChapters[chapter.id] && (
                        <div className="divide-y divide-gray-100">
                          {chapter.Lessons?.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              onClick={() => lesson.is_preview && openPreviewModal(lesson)}
                              className={`flex items-center justify-between py-3 px-4 ${lesson.is_preview ? "cursor-pointer hover:bg-blue-50/50" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className={`w-4 h-4 ${lesson.is_preview ? "text-blue-600" : "text-gray-400"}`} />
                                <span className={`text-sm ${lesson.is_preview ? "text-blue-700 font-medium" : "text-gray-700"}`}>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.is_preview && <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Preview</span>}
                                <span className="text-xs text-gray-400">{formatLessonDuration(lesson.duration || 0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Bio */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                     {course.Instructor?.Profile?.avatar_url ? (
                        <img src={course.Instructor.Profile.avatar_url} alt={instructorName} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-xl">{instructorInitials}</div>
                     )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 hover:underline cursor-pointer">{instructorName}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-3">{course.Instructor?.Profile?.headline}</p>
                    <div className="flex gap-4 text-xs text-gray-600 mb-4">
                      {instructorStats && (
                        <>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-gray-600" /> {instructorStats.averageRating} Rating</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {instructorStats.totalStudents.toLocaleString()} Students</span>
                          <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" /> {instructorStats.totalCourses} Courses</span>
                        </>
                      )}
                      
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{course.Instructor?.Profile?.bio || <span className="text-gray-500">No bio yet</span>}</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div id="reviews" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Student Feedback</h2>
                    {isEnrolled && <Button variant="outline" size="sm" onClick={() => setShowRatingModal(true)}>Write a Review</Button>}
                 </div>
                 
                 {/* Rating Summary Block */}
                 {reviews.length > 0 && (
                   <div className="flex flex-col sm:flex-row gap-8 mb-8">
                     <div className="flex flex-col items-center justify-center text-center">
                       <span className="text-5xl font-bold text-gray-900">{course.average_rating}</span>
                       <div className="flex my-2 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-4 h-4 ${i < Math.round(course.average_rating) ? "fill-current" : "text-gray-300 fill-gray-300"}`} />
                          ))}
                       </div>
                       <span className="text-xs text-gray-500 font-medium">Course Rating</span>
                     </div>
                     <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map(stars => {
                           const count = reviews.filter(r => r.rating === stars).length;
                           const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                           return (
                             <div key={stars} className="flex items-center gap-3 text-xs">
                               <div className="w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-gray-700" style={{ width: `${pct}%` }}></div>
                               </div>
                               <div className="flex text-yellow-400 w-16">
                                  {[...Array(5)].map((_, i) => (
                                     <Star key={i} className={`w-3 h-3 ${i < stars ? "fill-current" : "text-transparent"}`} />
                                  ))}
                               </div>
                               <span className="text-gray-400">{pct.toFixed(0)}%</span>
                             </div>
                           )
                        })}
                     </div>
                   </div>
                 )}
                 
                 {/* Reviews List */}
                 <div className="space-y-6">
                   {reviewsLoading ? (
                     <div className="text-center py-8 text-gray-400">Loading reviews...</div>
                   ) : reviews.length === 0 ? (
                     <p className="text-gray-500 text-center py-8">No reviews yet.</p>
                   ) : (
                     (showAllReviews ? reviews : reviews.slice(0,3)).map(review => (
                       <ReviewCard key={review.id} review={review} />
                     ))
                   )}
                 </div>
                 
                 {reviews.length > 3 && (
                   <Button variant="ghost" className="w-full mt-4 text-blue-600" onClick={() => setShowAllReviews(!showAllReviews)}>
                     {showAllReviews ? "Show Less" : "See More Reviews"}
                   </Button>
                 )}
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN: Sticky Glassy Card === */}
          {/* Reduced width to w-[340px] and added glassy visual effects */}
          <div className="w-full lg:w-[340px] flex-shrink-0 relative z-20">
            <div className="sticky top-6">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/40 bg-white/90 backdrop-blur-xl">
                
                {/* Video Thumbnail area */}
                <div 
                   onClick={handleIntroClick}
                   className="relative aspect-video bg-gray-900 cursor-pointer group border-b border-gray-100"
                >
                  <img
                    src={course.thumbnail_url || "https://via.placeholder.com/400x225"}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-900 fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 w-full text-center">
                    <span className="text-white text-xs font-bold drop-shadow-md">Preview this course</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                   {/* Price */}
                   <div className="flex items-center gap-3 mb-5">
                      {activeDiscount ? (
                        <>
                          <span className="text-3xl font-bold text-gray-900">{formatPrice(activeDiscount.discountedPrice)}</span>
                          <span className="text-lg text-gray-400 line-through font-normal">{formatPrice(activeDiscount.originalPrice)}</span>
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded ml-auto">{activeDiscount.value}% OFF</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
                      )}
                   </div>

                   {/* Main Button */}
                   <Button 
                      onClick={handleEnroll} 
                      className="w-full h-12 text-base font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 mb-3"
                   >
                     Enroll Now
                   </Button>
                   <p className="text-xs text-center text-gray-500 mb-6">30-Day Money-Back Guarantee</p>
                   
                   {/* Includes List */}
                   <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-900">This course includes:</h4>
                      <ul className="text-sm text-gray-600 space-y-2.5">
                        <li className="flex items-center gap-3">
                           <PlayCircle className="w-4 h-4 text-gray-400" />
                           <span>{formatDuration(totalDuration)} on-demand video</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-gray-400" />
                           <span>{course.total_resources || 0} downloadable resources</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <Infinity className="w-4 h-4 text-gray-400" />
                           <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <Smartphone className="w-4 h-4 text-gray-400" />
                           <span>Access on mobile and TV</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <Award className="w-4 h-4 text-gray-400" />
                           <span>Certificate of completion</span>
                        </li>
                      </ul>
                   </div>
                   
                   {/* Footer Links */}
                   <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                      <button className="text-xs font-semibold text-gray-900 underline">Share</button>
                      <button className="text-xs font-semibold text-gray-900 underline">Gift this course</button>
                      <button className="text-xs font-semibold text-gray-900 underline">Apply Coupon</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Modals */}
        <PreviewLessonModal isOpen={previewModal.isOpen} onClose={closePreviewModal} lesson={previewModal.lesson} />
        <RatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} courseId={params.id} courseName={course?.title || ""} onSubmitSuccess={handleRatingSuccess} />
      </div>
    </div>
  );
}