import { useState } from "react";
import {
  Clock,
  Users,
  Award,
  PlayCircle,
  FileText,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CoursePreview({ courseData }) {
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const isLesson = (item) => {
    return "type" in item;
  };

  // Sort chapters by order_number
  const sortedChapters = [...(courseData.chapters || [])].sort(
    (a, b) => (a.order_number || 0) - (b.order_number || 0)
  );

  // Calculate statistics
  const totalLessons = sortedChapters.reduce(
    (acc, chapter) =>
      acc + (chapter.items || []).filter((item) => isLesson(item)).length,
    0
  );
  const totalQuizzes = sortedChapters.reduce(
    (acc, chapter) =>
      acc + (chapter.items || []).filter((item) => !isLesson(item)).length,
    0
  );

  // Calculate prices
  const originalPrice = parseFloat(courseData.price) || 0;
  const discountPercent = parseFloat(courseData.discount) || 0;
  const discountedPrice =
    originalPrice - (originalPrice * discountPercent) / 100;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-neutral-900 text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Left Content */}
            <div>
              {/* Breadcrumb */}
              {courseData.category && (
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4">
                  <span className="capitalize">{courseData.category}</span>
                  {courseData.subcategory && (
                    <>
                      <span>/</span>
                      <span>{courseData.subcategory}</span>
                    </>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-white mb-4">
                {courseData.title || "Untitled Course"}
              </h1>

              {/* Description */}
              <p className="text-neutral-300 mb-6">
                {courseData.description || "No description available"}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm">5.0 (New)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>0 students</span>
                </div>
                {courseData.level && (
                  <Badge
                    variant="secondary"
                    className="capitalize bg-white/10 text-white border-white/20"
                  >
                    {courseData.level}
                  </Badge>
                )}
              </div>
            </div>

            {/* Right Card - Course Preview Card */}
            <div>
              <Card className="overflow-hidden sticky top-24">
                {/* Intro Video or Thumbnail */}
                {courseData.introVideoUrl || courseData.intro_video_url ? (
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <video
                      src={courseData.introVideoUrl || courseData.intro_video_url}
                      controls
                      className="w-full h-full"
                      poster={courseData.thumbnail || courseData.thumbnail_url}
                    />
                  </div>
                ) : courseData.thumbnail || courseData.thumbnail_url ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={courseData.thumbnail || courseData.thumbnail_url}
                      alt={courseData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-neutral-200 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-neutral-400" />
                  </div>
                )}

                <div className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    {courseData.price ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-neutral-900">
                          ${discountedPrice.toFixed(2)}
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-neutral-500 line-through">
                              ${originalPrice.toFixed(2)}
                            </span>
                            <Badge variant="destructive" className="bg-red-600">
                              {discountPercent}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-900">Price not set</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-4">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Add to Cart
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  {/* Course Includes */}
                  <div className="space-y-3 text-sm">
                    <p className="text-neutral-700">This course includes:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <PlayCircle className="w-4 h-4" />
                        <span>
                          {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>
                          {totalQuizzes} quiz{totalQuizzes !== 1 ? "zes" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Award className="w-4 h-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            {/* What You'll Learn */}
            <Card className="p-6">
              <h2 className="text-neutral-900 mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.learning_objectives ? (
                  courseData.learning_objectives.split('\n').filter(obj => obj.trim()).map((objective, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 text-xs">✓</span>
                      </div>
                      <p className="text-sm text-neutral-700">
                        {objective.trim()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500 col-span-2">
                    No learning objectives specified
                  </p>
                )}
              </div>
            </Card>

            {/* Course Curriculum */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-neutral-900">Course Curriculum</h2>
                <p className="text-sm text-neutral-600">
                  {sortedChapters.length} chapter
                  {sortedChapters.length !== 1 ? "s" : ""} • {totalLessons}{" "}
                  lesson{totalLessons !== 1 ? "s" : ""} • {totalQuizzes} quiz
                  {totalQuizzes !== 1 ? "zes" : ""}
                </p>
              </div>

              <div className="space-y-2">
                {sortedChapters.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No curriculum added yet
                  </div>
                ) : (
                  sortedChapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="border border-neutral-200 rounded-lg overflow-hidden"
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-neutral-600">
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-neutral-900">
                            Chapter {index + 1}: {chapter.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {
                              chapter.items.filter((item) => isLesson(item))
                                .length
                            }{" "}
                            lesson
                            {chapter.items.filter((item) => isLesson(item))
                              .length !== 1
                              ? "s"
                              : ""}{" "}
                            •{" "}
                            {
                              chapter.items.filter((item) => !isLesson(item))
                                .length
                            }{" "}
                            quiz
                            {chapter.items.filter((item) => !isLesson(item))
                              .length !== 1
                              ? "zes"
                              : ""}
                          </p>
                        </div>
                      </button>

                      {/* Chapter Items */}
                      {expandedChapters.has(chapter.id) && (
                        <div className="border-t border-neutral-200 bg-neutral-50">
                          {/* Sort items by order_number */}
                          {[...(chapter.items || [])]
                            .sort((a, b) => (a.order_number || 0) - (b.order_number || 0))
                            .map((item, itemIndex) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0"
                              >
                                {isLesson(item) ? (
                                  <>
                                    {item.type === "video" ? (
                                      <PlayCircle className="w-4 h-4 text-neutral-500" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-neutral-500" />
                                    )}
                                    <span className="text-sm text-neutral-700">
                                      {item.title}
                                    </span>
                                    {item.type === "video" && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-auto text-xs"
                                      >
                                        Video
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <HelpCircle className="w-4 h-4 text-neutral-500" />
                                    <span className="text-sm text-neutral-700">
                                      {item.title}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="ml-auto text-xs"
                                    >
                                      {item.questions_length || item.questions?.length || 0} question
                                      {(item.questions_length || item.questions?.length || 0) !== 1 ? "s" : ""}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="text-neutral-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {courseData.requirements ? (
                  courseData.requirements.split('\n').filter(req => req.trim()).map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="text-neutral-400 mt-1">•</span>
                      <span>{requirement.trim()}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-sm text-neutral-500">
                    <span className="text-neutral-400 mt-1">•</span>
                    <span>No specific requirements</span>
                  </li>
                )}
              </ul>
            </Card>

            {/* Target Audience */}
            {courseData.target_audience && (
              <Card className="p-6">
                <h2 className="text-neutral-900 mb-4">Who This Course Is For</h2>
                <ul className="space-y-2">
                  {courseData.target_audience.split('\n').filter(aud => aud.trim()).map((audience, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="text-neutral-400 mt-1">•</span>
                      <span>{audience.trim()}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-neutral-900 mb-4">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {courseData.description ||
                    "No detailed description available"}
                </p>
              </div>
            </Card>
          </div>

          {/* Right sidebar - empty for now, could add instructor info, etc. */}
          <div className="hidden lg:block">
            {/* Placeholder for additional content */}
          </div>
        </div>
      </div>
    </div>
  );
}
