"use client";

import { use, useState } from "react";
import { Suspense } from "react";
import { useLearningPage } from "@/hooks/enrollments/useLearningPage";


import LearningPageLayout from "@/components/pages/enrollments/learning/LearningPageLayout";
import CourseHeader from "@/components/pages/enrollments/learning/CourseHeader";
import CurriculumSidebar from "@/components/pages/enrollments/learning/CurriculumSidebar";


import LessonContent from "@/components/pages/enrollments/learning/LessonContent";
import QuizContent from "@/components/pages/enrollments/learning/QuizContent";
import LessonHeader from "@/components/pages/enrollments/learning/LessonHeader";
import NavigationButtons from "@/components/pages/enrollments/learning/NavigationButtons";
import ContentTabs from "@/components/pages/enrollments/learning/ContentTabs";


import LoadingState from "@/components/pages/enrollments/LoadingState";
import ErrorState from "@/components/pages/enrollments/ErrorState";
import ReportModal from "@/components/modals/ReportModal";


export default function EnrolledCoursePage({ params }) {
  
  const { enrollmentId } = use(params);

  const {
    
    course,
    chapters,
    progress,
    currentLesson,
    currentQuiz,
    contentType,
    upNextLessons,
    totalLessons,
    completedCount,
    chatMembership,

    
    isLoading,
    isLessonLoading,
    error,
    activeTab,
    autoplay,
    expandedSections,
    hasPrevious,
    hasNext,

    
    selectLesson,
    selectQuiz,
    markLessonComplete,
    handleVideoProgress,
    goToNextLesson,
    goToPreviousLesson,
    setActiveTab,
    toggleAutoplay,
    toggleSection,
    handleVideoEnd,
    submitQuiz,
    refetch,
  } = useLearningPage(enrollmentId);

  const [reportState, setReportState] = useState({
    isOpen: false,
    contentReference: null,
    contentType: null,
    contentTitle: "",
  });

  const handleReport = (type, id, title) => {
    setReportState({
      isOpen: true,
      contentReference: id,
      contentType: type,
      contentTitle: title,
    });
  };

  const closeReportModal = () => {
    setReportState((prev) => ({ ...prev, isOpen: false }));
  };

  
  const isCurrentLessonCompleted = currentLesson
    ? progress?.completedLessons?.includes(currentLesson.id)
    : false;

  
  const isCurrentQuizCompleted = currentQuiz
    ? progress?.completedQuizzes?.includes(currentQuiz.id)
    : false;

  
  const currentQuizScore = currentQuiz
    ? progress?.quizScores?.[currentQuiz.id]
    : null;

  
  if (isLoading) {
    return <LoadingState />;
  }

  
  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  
  const instructor = course?.User;
  const instructorName = instructor
    ? `${instructor.first_name} ${instructor.last_name}`
    : "Instructor";
  const instructorAvatar = instructor?.Profile?.avatar_url;

  return (
    <>
    <LearningPageLayout
      header={
        <CourseHeader
          courseTitle={course?.title}
          instructorName={instructorName}
          instructorAvatar={instructorAvatar}
          progressPercentage={progress?.completionPercentage || 0}
          courseId={course?.id}
          chatMembership={chatMembership}
        />
      }
      sidebar={
        <CurriculumSidebar
          chapters={chapters}
          currentLessonId={currentLesson?.id}
          completedLessons={progress?.completedLessons || []}
          completedQuizzes={progress?.completedQuizzes || []}
          progressPercentage={progress?.completionPercentage || 0}
          totalLessons={totalLessons}
          completedCount={completedCount}
          expandedSections={expandedSections}
          onLessonSelect={selectLesson}
          onQuizSelect={selectQuiz}
          onToggleSection={toggleSection}
        />
      }
      mainContent={
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {}
          {contentType === "quiz" ? (
            <>
              {}
              <QuizContent
                quiz={currentQuiz}
                isLoading={isLessonLoading}
                isCompleted={isCurrentQuizCompleted}
                previousScore={currentQuizScore}
                onSubmit={async (answers) => {
                  return await submitQuiz(currentQuiz.id, answers);
                }}
                onReportClick={() => handleReport("quiz", currentQuiz?.id, currentQuiz?.title)}
              />

              {}
              <div className="mt-6">
                <NavigationButtons
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  autoplay={false}
                  onPrevious={goToPreviousLesson}
                  onNext={goToNextLesson}
                  onAutoplayToggle={() => {}}
                  hideAutoplay={true}
                />
              </div>
            </>
          ) : (
            <>
              {}
              <LessonContent
                lesson={currentLesson}
                isLoading={isLessonLoading}
                onVideoEnd={handleVideoEnd}
                onVideoProgress={handleVideoProgress}
                onMarkComplete={() => markLessonComplete(currentLesson?.id)}
                isCompleted={isCurrentLessonCompleted}
                autoplay={autoplay}
              />

              {}
              <LessonHeader
                lessonTitle={currentLesson?.title || "Select a lesson"}
                instructorName={instructorName}
                instructorAvatar={instructorAvatar}
                duration={currentLesson?.duration}
                onNotesClick={() => {
                  
                  console.log("Notes clicked");
                }}
                onReportClick={() => handleReport("lesson", currentLesson?.id, currentLesson?.title)}
              />

              {}
              <NavigationButtons
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                autoplay={autoplay}
                onPrevious={goToPreviousLesson}
                onNext={goToNextLesson}
                onAutoplayToggle={toggleAutoplay}
              />

              {}
              <ContentTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                lesson={currentLesson}
                upNextLessons={upNextLessons}
                onLessonSelect={selectLesson}
              />
            </>
          )}
        </div>
      }
    />
    <ReportModal
        isOpen={reportState.isOpen}
        onClose={closeReportModal}
        contentReference={reportState.contentReference}
        contentType={reportState.contentType}
        contentTitle={reportState.contentTitle}
      />
    </>
  );
}
