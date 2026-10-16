import User from "../../models/auth/user.model.js";
import Course from "../../models/courses/course.model.js";
import Enrollment from "../../models/courses/enrollment.model.js";
import Payment from "../../models/payments/payment.model.js";
import Ratings from "../../models/courses/Ratings.model.js";

export const getAllInstructors = async (filters = {}) => {
  const query = { role: "instructor" };

  if (filters.status) {
    query.is_active = filters.status === "active";
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { first_name: searchRegex },
      { last_name: searchRegex },
      { email: searchRegex }
    ];
  }

  const instructors = await User.find(query)
    .select("_id id first_name last_name email is_active createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const instructorsWithMetrics = await Promise.all(
    instructors.map(async (instructor) => {
      const instId = instructor._id.toString();
      const metrics = await getInstructorMetrics(instId);
      return {
        id: instId,
        name: `${instructor.first_name} ${instructor.last_name}`,
        email: instructor.email,
        isActive: instructor.is_active,
        joinedAt: instructor.createdAt,
        ...metrics
      };
    })
  );

  return instructorsWithMetrics;
};

export const getInstructorMetrics = async (instructorId) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map(c => c._id.toString());
  const courseCount = courses.length;

  if (courseIds.length === 0) {
    return {
      courseCount: 0,
      totalStudents: 0,
      totalRevenue: "0.00",
      earnings: "0.00",
      avgRating: null
    };
  }

  const distinctStudents = await Enrollment.distinct("student_id", { course_id: { $in: courseIds } });
  const totalStudents = distinctStudents.length;

  const [revResult] = await Payment.aggregate([
    { $match: { course_id: { $in: courseIds }, status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  const totalRevenue = revResult?.totalRevenue || 0;

  const commissionRate = 0.20;
  const earnings = totalRevenue * (1 - commissionRate);

  const [ratingResult] = await Ratings.aggregate([
    { $match: { course_id: { $in: courseIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);

  const avgRating = ratingResult?.avgRating
    ? parseFloat(ratingResult.avgRating.toFixed(1))
    : null;

  return {
    courseCount,
    totalStudents,
    totalRevenue: parseFloat(totalRevenue).toFixed(2),
    earnings: parseFloat(earnings).toFixed(2),
    avgRating
  };
};

export const getInstructorDetails = async (instructorId) => {
  const instructor = await User.findById(instructorId)
    .select("_id id first_name last_name email role is_active createdAt")
    .lean();

  if (!instructor || instructor.role !== "instructor") {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  const courses = await Course.find({ instructor_id: instructorId.toString() })
    .select("_id id title status price createdAt")
    .lean();

  const metrics = await getInstructorMetrics(instructorId);
  const performance = await getInstructorPerformance(instructorId);

  return {
    id: instructor._id.toString(),
    name: `${instructor.first_name} ${instructor.last_name}`,
    email: instructor.email,
    isActive: instructor.is_active,
    joinedAt: instructor.createdAt,
    courses: courses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt
    })),
    metrics,
    performance
  };
};

export const getInstructorPerformance = async (instructorId) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map(c => c._id.toString());

  if (courseIds.length === 0) {
    return {
      completionRate: 0,
      avgProgress: 0,
      satisfactionScore: null,
      recentEnrollments: 0,
      totalEnrollments: 0,
      reviewCount: 0
    };
  }

  const enrollments = await Enrollment.find({ course_id: { $in: courseIds } }).lean();

  let completedCount = 0;
  let totalProgress = 0;

  enrollments.forEach(enrollment => {
    const progress = enrollment.progress || {};
    const completionPercentage = progress.completionPercentage || progress.progress_percentage || 0;
    totalProgress += completionPercentage;
    if (completionPercentage === 100) completedCount++;
  });

  const completionRate = enrollments.length > 0
    ? ((completedCount / enrollments.length) * 100).toFixed(1)
    : 0;

  const avgProgress = enrollments.length > 0
    ? (totalProgress / enrollments.length).toFixed(1)
    : 0;

  const reviews = await Ratings.find({ course_id: { $in: courseIds } }).select("rating").lean();

  const satisfactionScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEnrollments = await Enrollment.countDocuments({
    course_id: { $in: courseIds },
    $or: [
      { enrolled_at: { $gte: thirtyDaysAgo } },
      { createdAt: { $gte: thirtyDaysAgo } }
    ]
  });

  return {
    completionRate: parseFloat(completionRate),
    avgProgress: parseFloat(avgProgress),
    satisfactionScore: satisfactionScore ? parseFloat(satisfactionScore) : null,
    recentEnrollments,
    totalEnrollments: enrollments.length,
    reviewCount: reviews.length
  };
};

export const updateInstructorStatus = async (instructorId, isActive) => {
  const instructor = await User.findById(instructorId);

  if (!instructor || instructor.role !== "instructor") {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  instructor.is_active = isActive;
  await instructor.save();

  if (!isActive) {
    await Course.updateMany(
      { instructor_id: instructorId.toString() },
      { $set: { is_published: false } }
    );
  }

  return instructor;
};

export const getInstructorPayoutHistory = async (instructorId) => {
  const courses = await Course.find({ instructor_id: instructorId.toString() }).select("_id").lean();
  const courseIds = courses.map(c => c._id.toString());

  const payments = await Payment.find({
    course_id: { $in: courseIds },
    status: "completed"
  }).sort({ createdAt: -1 }).lean();

  const commissionRate = 0.20;

  return await Promise.all(
    payments.map(async (payment) => {
      const course = await Course.findById(payment.course_id).select("title").lean();
      return {
        id: payment._id.toString(),
        amount: parseFloat(payment.amount || 0).toFixed(2),
        instructorEarning: parseFloat((payment.amount || 0) * (1 - commissionRate)).toFixed(2),
        courseTitle: course?.title || "Unknown Course",
        date: payment.createdAt || payment.created_at,
        status: "pending"
      };
    })
  );
};
