import {
  Course,
  Enrollment,
  Payment,
  Ratings,
  Lesson,
  Quiz,
  QuizResult,
  ChatMessage,
  ChatRoom,
  Chapter,
  Category,
  SubCategory,
} from "../../models/index.js";

export const getComprehensiveAnalytics = async (instructorId, courseId = null, days = 30) => {
  try {
    const courseFilter = {
      instructor_id: instructorId.toString(),
      status: { $in: ["approved", "published"] },
    };

    if (courseId) {
      courseFilter._id = courseId;
    }

    const courses = await Course.find(courseFilter).select("_id title price").lean();

    if (courses.length === 0) {
      return {
        overview: {
          totalEnrollments: 0,
          activeStudents: 0,
          completionRate: 0,
          averageRating: 0,
          totalRevenue: 0,
          averageWatchTime: 0,
        },
        courses: [],
        enrollmentTrend: [],
        lessonAnalytics: [],
        quizAnalytics: {
          averageScore: 0,
          passRate: 0,
          totalAttempts: 0,
          mostMissedQuestions: [],
        },
        engagement: {
          chatParticipation: 0,
          averageSessionDuration: 0,
          activeStudentsPerDay: [],
        },
      };
    }

    const courseIds = courses.map((c) => c._id.toString());

    const [
      overview,
      coursesPerformance,
      enrollmentTrend,
      lessonAnalytics,
      quizAnalytics,
      engagement,
    ] = await Promise.all([
      getOverviewStats(courseIds),
      getCoursesPerformance(courses),
      getEnrollmentTrend(courseIds, days),
      getLessonAnalytics(courseIds),
      getQuizAnalytics(courseIds),
      getEngagementMetrics(courseIds, days),
    ]);

    return {
      overview,
      courses: coursesPerformance,
      enrollmentTrend,
      lessonAnalytics,
      quizAnalytics,
      engagement,
    };
  } catch (error) {
    console.error("Error in getComprehensiveAnalytics:", error);
    throw error;
  }
};

const getOverviewStats = async (courseIds) => {
  const enrollments = await Enrollment.find({ course_id: { $in: courseIds } })
    .select("progress updatedAt")
    .lean();

  const totalEnrollments = enrollments.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let activeStudents = 0;
  let completedCount = 0;
  let totalWatchTime = 0;
  let studentsWithWatchTime = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

    if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
      activeStudents++;
    }

    const pct = progress.completionPercentage || progress.progress_percentage || 0;
    if (pct === 100) {
      completedCount++;
    }

    if (progress.totalWatchTime && progress.totalWatchTime > 0) {
      totalWatchTime += progress.totalWatchTime;
      studentsWithWatchTime++;
    }
  });

  const completionRate =
    totalEnrollments > 0
      ? parseFloat(((completedCount / totalEnrollments) * 100).toFixed(1))
      : 0;

  const [ratingAgg] = await Ratings.aggregate([
    { $match: { course_id: { $in: courseIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  const averageRating = ratingAgg?.avgRating
    ? parseFloat(ratingAgg.avgRating.toFixed(1))
    : 0;

  const [revAgg] = await Payment.aggregate([
    { $match: { course_id: { $in: courseIds }, status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const totalRevenue = revAgg?.totalRevenue || 0;

  const averageWatchTime =
    studentsWithWatchTime > 0
      ? parseFloat((totalWatchTime / studentsWithWatchTime / 3600).toFixed(1))
      : 0;

  return {
    totalEnrollments,
    activeStudents,
    completionRate,
    averageRating,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageWatchTime,
  };
};

const getCoursesPerformance = async (courses) => {
  const coursesPerformance = await Promise.all(
    courses.map(async (course) => {
      const courseIdStr = course._id.toString();

      const enrollments = await Enrollment.find({ course_id: courseIdStr })
        .select("progress updatedAt")
        .lean();

      const totalEnrollments = enrollments.length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let activeStudents = 0;
      let completedCount = 0;

      enrollments.forEach((enrollment) => {
        const progress = enrollment.progress || {};
        const lastAccessed = progress.lastAccessed
          ? new Date(progress.lastAccessed)
          : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

        if (lastAccessed && lastAccessed >= thirtyDaysAgo) {
          activeStudents++;
        }

        const pct = progress.completionPercentage || progress.progress_percentage || 0;
        if (pct === 100) {
          completedCount++;
        }
      });

      const completionRate =
        totalEnrollments > 0
          ? parseFloat(((completedCount / totalEnrollments) * 100).toFixed(1))
          : 0;

      const [ratingAgg] = await Ratings.aggregate([
        { $match: { course_id: courseIdStr } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);

      const averageRating = ratingAgg?.avgRating
        ? parseFloat(ratingAgg.avgRating.toFixed(1))
        : 0;

      const [revAgg] = await Payment.aggregate([
        { $match: { course_id: courseIdStr, status: "completed" } },
        { $group: { _id: null, revenue: { $sum: "$amount" } } },
      ]);

      const revenue = revAgg?.revenue || 0;

      return {
        id: courseIdStr,
        title: course.title,
        enrollments: totalEnrollments,
        activeStudents,
        completionRate,
        averageRating,
        revenue: parseFloat(revenue.toFixed(2)),
      };
    })
  );

  return coursesPerformance;
};

const getEnrollmentTrend = async (courseIds, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await Enrollment.find({
    course_id: { $in: courseIds },
    createdAt: { $gte: startDate },
  })
    .select("createdAt enrolled_at")
    .sort({ createdAt: 1 })
    .lean();

  const weeklyData = {};
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  enrollments.forEach((enrollment) => {
    const enrollDate = new Date(enrollment.enrolled_at || enrollment.createdAt);
    const weeksDiff = Math.floor((enrollDate - startDate) / msPerWeek);
    const weekKey = `Week ${weeksDiff + 1}`;

    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
  });

  return Object.entries(weeklyData).map(([date, count]) => ({
    date,
    enrollments: count,
  }));
};

const getLessonAnalytics = async (courseIds) => {
  const chapters = await Chapter.find({ course_id: { $in: courseIds } }).select("_id").lean();
  const chapterIds = chapters.map((ch) => ch._id.toString());

  const lessons = await Lesson.find({ chapter_id: { $in: chapterIds } })
    .select("_id title duration")
    .lean();

  if (lessons.length === 0) {
    return [];
  }

  const enrollments = await Enrollment.find({ course_id: { $in: courseIds } })
    .select("progress")
    .lean();

  const totalEnrollments = enrollments.length;

  return lessons.map((lesson) => {
    const lessonIdStr = lesson._id.toString();
    let views = 0;
    let totalWatchTime = 0;
    let watchTimeCount = 0;

    enrollments.forEach((enrollment) => {
      const progress = enrollment.progress || {};

      if (progress.completedLessons?.map(String).includes(lessonIdStr)) {
        views++;
      }

      const lessonWatchTime = progress.lessonWatchTime?.[lessonIdStr];
      if (lessonWatchTime && lessonWatchTime > 0) {
        totalWatchTime += lessonWatchTime;
        watchTimeCount++;
      }
    });

    const avgWatchTime =
      watchTimeCount > 0
        ? parseFloat((totalWatchTime / watchTimeCount / 60).toFixed(1))
        : 0;

    const completionRate =
      totalEnrollments > 0
        ? parseFloat(((views / totalEnrollments) * 100).toFixed(1))
        : 0;

    const dropOffRate = parseFloat((100 - completionRate).toFixed(1));

    return {
      id: lessonIdStr,
      title: lesson.title,
      views,
      avgWatchTime,
      completionRate,
      dropOffRate,
    };
  });
};

const getQuizAnalytics = async (courseIds) => {
  const chapters = await Chapter.find({ course_id: { $in: courseIds } }).select("_id").lean();
  const chapterIds = chapters.map((ch) => ch._id.toString());

  const quizzes = await Quiz.find({ chapter_id: { $in: chapterIds } })
    .select("_id questions")
    .lean();

  if (quizzes.length === 0) {
    return {
      averageScore: 0,
      passRate: 0,
      totalAttempts: 0,
      mostMissedQuestions: [],
    };
  }

  const quizIds = quizzes.map((q) => q._id.toString());

  const quizResults = await QuizResult.find({ quiz_id: { $in: quizIds } })
    .select("score answers quiz_id")
    .lean();

  const totalAttempts = quizResults.length;

  if (totalAttempts === 0) {
    return {
      averageScore: 0,
      passRate: 0,
      totalAttempts: 0,
      mostMissedQuestions: [],
    };
  }

  const totalScore = quizResults.reduce((sum, result) => sum + (result.score || 0), 0);
  const averageScore = parseFloat((totalScore / totalAttempts).toFixed(1));

  const passCount = quizResults.filter((result) => (result.score || 0) >= 60).length;
  const passRate = parseFloat(((passCount / totalAttempts) * 100).toFixed(1));

  const questionStats = {};

  quizzes.forEach((quiz) => {
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q) => {
        const qId = q.id || q._id?.toString();
        if (qId && q.question) {
          questionStats[qId] = {
            question: q.question,
            total: 0,
            missed: 0,
          };
        }
      });
    }
  });

  quizResults.forEach((result) => {
    if (result.answers && Array.isArray(result.answers)) {
      result.answers.forEach((answer) => {
        const aId = answer.id || answer._id?.toString();
        if (questionStats[aId]) {
          questionStats[aId].total++;
          if (!answer.isCorrect) {
            questionStats[aId].missed++;
          }
        }
      });
    }
  });

  const mostMissedQuestions = Object.values(questionStats)
    .filter((stat) => stat.total > 0)
    .map((stat) => ({
      question: stat.question,
      missRate: parseFloat(((stat.missed / stat.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 5);

  return {
    averageScore,
    passRate,
    totalAttempts,
    mostMissedQuestions,
  };
};

const getEngagementMetrics = async (courseIds, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await Enrollment.find({ course_id: { $in: courseIds } })
    .select("progress updatedAt")
    .lean();

  const totalEnrollments = enrollments.length;

  let totalWatchTime = 0;
  let studentsWithWatchTime = 0;

  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    if (progress.totalWatchTime && progress.totalWatchTime > 0) {
      totalWatchTime += progress.totalWatchTime;
      studentsWithWatchTime++;
    }
  });

  const averageSessionDuration =
    studentsWithWatchTime > 0
      ? Math.round(totalWatchTime / studentsWithWatchTime / 60)
      : 0;

  const chatRooms = await ChatRoom.find({
    course_id: { $in: courseIds },
    type: "group",
  }).select("_id").lean();

  const chatRoomIds = chatRooms.map((r) => r._id.toString());

  let chatParticipation = 0;
  if (chatRoomIds.length > 0) {
    const senders = await ChatMessage.distinct("sender_id", {
      room_id: { $in: chatRoomIds },
    });

    chatParticipation =
      totalEnrollments > 0
        ? parseFloat(((senders.length / totalEnrollments) * 100).toFixed(1))
        : 0;
  }

  const dayOfWeekMap = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const activeByDay = {};
  enrollments.forEach((enrollment) => {
    const progress = enrollment.progress || {};
    const lastAccessed = progress.lastAccessed
      ? new Date(progress.lastAccessed)
      : enrollment.updatedAt ? new Date(enrollment.updatedAt) : null;

    if (lastAccessed && lastAccessed >= startDate) {
      const dayOfWeek = lastAccessed.getDay();
      const dayName = dayOfWeekMap[dayOfWeek];
      activeByDay[dayName] = (activeByDay[dayName] || 0) + 1;
    }
  });

  const activeStudentsPerDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({
      day,
      count: activeByDay[day] || 0,
    })
  );

  return {
    chatParticipation,
    averageSessionDuration,
    activeStudentsPerDay,
  };
};

export const exportAnalyticsData = async (instructorId, courseId = null, days = 30) => {
  const analytics = await getComprehensiveAnalytics(instructorId, courseId, days);

  return {
    ...analytics,
    exported_at: new Date().toISOString(),
    instructor_id: instructorId,
    course_id: courseId,
    period_days: days,
  };
};

export const getAllCoursesService = async (instructorId) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() })
    .select("_id id title subtitle description level price thumbnail_url status category_id sub_category_id createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  return await Promise.all(
    courses.map(async (course) => {
      let category = null;
      let subCategory = null;

      if (course.category_id) {
        category = await Category.findById(course.category_id).select("name").lean();
      }
      if (course.sub_category_id) {
        subCategory = await SubCategory.findById(course.sub_category_id).select("name").lean();
      }

      return {
        id: course._id.toString(),
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        level: course.level,
        price: course.price,
        thumbnail_url: course.thumbnail_url,
        status: course.status,
        Category: category ? { name: category.name } : null,
        SubCategory: subCategory ? { name: subCategory.name } : null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    })
  );
};
