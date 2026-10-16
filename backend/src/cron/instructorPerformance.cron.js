import User from "../models/auth/user.model.js";
import Course from "../models/courses/course.model.js";
import Enrollment from "../models/courses/enrollment.model.js";
import Ratings from "../models/courses/Ratings.model.js";
import Payment from "../models/payments/payment.model.js";
import { sendMail } from "../config/mailer.js";

const getInstructorPerformanceEmailHtml = (instructor, stats) => {
  const courseCards = stats.courses.map(course => {
    const avgRating = course.avgRating ? course.avgRating.toFixed(1) : "N/A";
    const stars = course.avgRating ? "⭐".repeat(Math.round(course.avgRating)) : "";
    
    return `
      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0;">${course.title}</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div style="text-align: center;">
            <p style="color: #3b82f6; font-size: 20px; font-weight: 700; margin: 0;">${course.enrollmentCount}</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">Students</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #fbbf24; font-size: 20px; font-weight: 700; margin: 0;">${avgRating}</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">Rating ${stars}</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #10b981; font-size: 20px; font-weight: 700; margin: 0;">$${course.revenue.toFixed(0)}</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">Revenue</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monthly Performance Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="width: 60px; height: 60px; background-color: #1e3a5f; border-radius: 50%; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">📊</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Monthly Performance Report</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Hey ${instructor.first_name}, here's your course performance!</p>
            </td>
          </tr>
          
          <!-- Overall Stats -->
          <tr>
            <td>
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">This Month's Overview</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                  <div>
                    <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">Total Students</p>
                    <p style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 4px 0 0 0;">${stats.totalEnrollments}</p>
                  </div>
                  <div>
                    <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">Total Revenue</p>
                    <p style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 4px 0 0 0;">$${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">Average Rating</p>
                    <p style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 4px 0 0 0;">${stats.avgRating.toFixed(1)} ⭐</p>
                  </div>
                  <div>
                    <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">Active Courses</p>
                    <p style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 4px 0 0 0;">${stats.courses.length}</p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Course Cards -->
          <tr>
            <td>
              <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Course Performance</h2>
              ${courseCards || '<p style="color: #94a3b8; font-size: 14px;">No courses yet. Create your first course!</p>'}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td align="center" style="padding 24px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard/instructor" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                View Full Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- Tips -->
          <tr>
            <td align="center">
              <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-top: 16px;">
                <p style="color: #fbbf24; font-size: 20px; margin: 0 0 8px 0;">💡</p>
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Pro Tip</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                  Courses with regular updates and active discussions tend to have 40% higher completion rates!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #475569; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Mentora</p>
              <p style="color: #475569; font-size: 11px; margin: 8px 0 0 0;">Keep inspiring learners! 🌟</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendInstructorPerformanceEmails = async () => {
  console.log("Starting instructor performance email job...");
  
  // Get all instructors
  const instructors = await User.find({
    role: "instructor",
    is_active: true,
    is_email_verified: true,
  }).select("_id id first_name last_name email");
  
  let sentCount = 0;
  let errorCount = 0;
  
  for (const instructor of instructors) {
    try {
      const instructorId = instructor._id.toString();
      // Get instructor's approved courses
      const courses = await Course.find({
        instructor_id: instructorId,
        status: "approved",
      }).select("_id id title price");
      
      // Skip if no courses
      if (courses.length === 0) continue;
      
      const courseStats = [];
      let totalEnrollments = 0;
      let totalRevenue = 0;
      let totalRatings = 0;
      let ratingSum = 0;
      
      for (const course of courses) {
        const courseId = course._id.toString();
        // Get enrollment count
        const enrollmentCount = await Enrollment.countDocuments({ course_id: courseId });
        
        // Get average rating
        const ratingsAggregation = await Ratings.aggregate([
          { $match: { course_id: courseId } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]);
        const avgRating = ratingsAggregation[0]?.avgRating ? Number(ratingsAggregation[0].avgRating) : 0;
        
        // Get revenue
        const paymentsAggregation = await Payment.aggregate([
          { $match: { course_id: courseId, status: "completed" } },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);
        const revenue = paymentsAggregation[0]?.totalAmount ? Number(paymentsAggregation[0].totalAmount) : 0;
        
        courseStats.push({
          title: course.title,
          enrollmentCount,
          avgRating,
          revenue,
        });
        
        totalEnrollments += enrollmentCount;
        totalRevenue += revenue;
        if (avgRating > 0) {
          ratingSum += avgRating;
          totalRatings++;
        }
      }
      
      const stats = {
        courses: courseStats,
        totalEnrollments,
        totalRevenue,
        avgRating: totalRatings > 0 ? ratingSum / totalRatings : 0,
      };
      
      const html = getInstructorPerformanceEmailHtml(instructor, stats);
      
      await sendMail(
        instructor.email,
        "📊 Your Monthly Course Performance Report - Mentora",
        html
      );
      
      sentCount++;
      console.log(`✉️ Sent performance email to ${instructor.email}`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      errorCount++;
      console.error(`Failed to send email to ${instructor.email}:`, error.message);
    }
  }
  
  console.log(`Instructor performance emails complete: ${sentCount} sent, ${errorCount} errors`);
  return { sentCount, errorCount };
};
