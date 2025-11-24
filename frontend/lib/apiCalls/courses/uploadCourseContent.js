import Cookies from "js-cookie";
import { createCourse } from "./createCourse";
import { createChapter } from "../chapters/createChapter";
import { createLesson } from "../lessons/createLesson";
import { createQuiz } from "../quizzes/createQuiz";

export default async function uploadCourseContent(courseData, onProgress) {
  try {
    const token = Cookies.get("authToken");

    if (!token) {
      throw new Error("Authentication required");
    }

    // Step 1: Create course with thumbnail
    onProgress({
      stage: "course",
      status: "uploading",
      message: "Creating course...",
      progress: 0,
    });

    const courseResponse = await createCourse(
      {
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        category: courseData.category,
        subcategory_id: courseData.subcategory_id,
        level: courseData.level,
        price: courseData.price,
        learning_objectives: courseData.learning_objectives,
        requirements: courseData.requirements,
        target_audience: courseData.target_audience,
      },
      courseData.thumbnailFile,
      (progress) => {
        onProgress({
          stage: "course",
          status: "uploading",
          message: "Uploading course thumbnail...",
          progress: progress,
        });
      },
      token
    );

    const courseId = courseResponse.data.id;

    onProgress({
      stage: "course",
      status: "complete",
      message: "Course created successfully",
      progress: 100,
    });

    // Step 1.5: Upload introduction video if provided
    if (courseData.introVideoFile) {
      onProgress({
        stage: "intro-video",
        status: "uploading",
        message: "Uploading introduction video...",
        progress: 0,
      });

      const { uploadVideoToCloudinary } = await import(
        "@/lib/services/cloudinary.service"
      );
      const { updateCourseIntroVideo } = await import(
        "@/lib/apiCalls/courses/updateIntroVideo.apiCall"
      );

      const introVideoResult = await uploadVideoToCloudinary(
        courseData.introVideoFile,
        (uploadProgress) => {
          onProgress({
            stage: "intro-video",
            status: "uploading",
            message:
              uploadProgress.message || "Uploading introduction video...",
            progress: uploadProgress.progress || 0,
          });
        }
      );

      await updateCourseIntroVideo(courseId, {
        intro_video_url: introVideoResult.secure_url,
        intro_video_public_id: introVideoResult.public_id,
        intro_video_hls_url: introVideoResult.hls_url,
        intro_video_duration: introVideoResult.duration,
      });

      onProgress({
        stage: "intro-video",
        status: "complete",
        message: "Introduction video uploaded",
        progress: 100,
      });
    }

    // Step 2: Process chapters sequentially
    const chapters = courseData.chapters || [];
    const totalChapters = chapters.length;

    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];

      onProgress({
        stage: "chapter",
        chapterIndex: chapterIndex + 1,
        totalChapters,
        status: "uploading",
        message: `Creating chapter ${chapterIndex + 1} of ${totalChapters}...`,
      });

      // Create chapter
      const chapterResponse = await createChapter(
        {
          course_id: courseId,
          title: chapter.title,
          description: chapter.description || "",
        },
        token
      );

      const chapterId = chapterResponse.data.id;

      onProgress({
        stage: "chapter",
        chapterIndex: chapterIndex + 1,
        totalChapters,
        status: "complete",
        message: `Chapter ${chapterIndex + 1} created`,
      });

      // Process lessons sequentially (lessons have a 'type' property with value 'video' or 'text')
      const lessons = chapter.items?.filter((item) => "type" in item) || [];
      const totalLessons = lessons.length;

      for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
        const lesson = lessons[lessonIndex];

        onProgress({
          stage: "lesson",
          chapterIndex: chapterIndex + 1,
          totalChapters,
          lessonIndex: lessonIndex + 1,
          totalLessons,
          status: "uploading",
          message: `Chapter ${chapterIndex + 1} / Lesson ${
            lessonIndex + 1
          } of ${totalLessons}...`,
          videoProgress: 0,
        });

        let videoUrl = null;
        let videoPublicId = null;
        let hlsUrl = null;
        let duration = lesson.duration || 0;

        // Upload video directly to Cloudinary if it's a video lesson
        if (lesson.type === "video" && lesson.videoFile) {
          const { uploadVideoToCloudinary } = await import(
            "@/lib/services/cloudinary.service"
          );

          const uploadResult = await uploadVideoToCloudinary(
            lesson.videoFile,
            (uploadProgress) => {
              onProgress({
                stage: "lesson",
                chapterIndex: chapterIndex + 1,
                totalChapters,
                lessonIndex: lessonIndex + 1,
                totalLessons,
                status: "uploading",
                message: uploadProgress.message || "Uploading video...",
                videoProgress: uploadProgress.progress || 0,
                uploadStage: uploadProgress.stage,
              });
            }
          );

          videoUrl = uploadResult.secure_url;
          videoPublicId = uploadResult.public_id;
          hlsUrl = uploadResult.hls_url;
          duration = uploadResult.duration || duration;
        }

        // Create lesson with video metadata
        await createLesson(
          {
            chapter_id: chapterId,
            title: lesson.title,
            lesson_type: lesson.type || "video",
            content: lesson.textContent || "",
            video_url: videoUrl,
            video_public_id: videoPublicId,
            hls_url: hlsUrl,
            is_preview: lesson.isPreview || false,
            duration: duration,
          },
          token
        );

        onProgress({
          stage: "lesson",
          chapterIndex: chapterIndex + 1,
          totalChapters,
          lessonIndex: lessonIndex + 1,
          totalLessons,
          status: "complete",
          message: `Chapter ${chapterIndex + 1} / Lesson ${
            lessonIndex + 1
          } complete`,
          videoProgress: 100,
        });
      }

      // Process quizzes sequentially (quizzes have a 'questions' property)
      const quizzes =
        chapter.items?.filter((item) => "questions" in item) || [];

      for (let quizIndex = 0; quizIndex < quizzes.length; quizIndex++) {
        const quiz = quizzes[quizIndex];

        onProgress({
          stage: "quiz",
          chapterIndex: chapterIndex + 1,
          totalChapters,
          quizIndex: quizIndex + 1,
          totalQuizzes: quizzes.length,
          status: "uploading",
          message: `Chapter ${chapterIndex + 1} / Quiz ${quizIndex + 1}...`,
        });

        await createQuiz(
          {
            chapter_id: chapterId,
            title: quiz.title,
            questions: quiz.questions || [],
          },
          token
        );

        onProgress({
          stage: "quiz",
          chapterIndex: chapterIndex + 1,
          totalChapters,
          quizIndex: quizIndex + 1,
          totalQuizzes: quizzes.length,
          status: "complete",
          message: `Chapter ${chapterIndex + 1} / Quiz ${
            quizIndex + 1
          } complete`,
        });
      }
    }

    // All done - Clear local storage and state
    onProgress({
      stage: "complete",
      status: "complete",
      message: "Course upload complete!",
      courseId,
    });

    // Clear course data from local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("courseData");
      localStorage.removeItem("courseDraft");
    }

    return {
      success: true,
      courseId,
      message: "Course created successfully",
    };
  } catch (error) {
    onProgress({
      stage: "error",
      status: "error",
      message: error.message || "Upload failed",
    });

    throw error;
  }
};
