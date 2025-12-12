import { Op } from "sequelize";
import models from "../models/index.js";
import { sendMail } from "../config/mailer.js";

const { User, Enrollment, Course, Lesson, Chapter } = models;

// Generate student progress email template
const getStudentProgressEmailHtml = (student, enrollments) => {
  const progressCards = enrollments.map(enrollment => {
    const progress = enrollment.progress || {};
    const percentage = progress.completionPercentage || 0;
    
    let statusMessage = "";
    let statusColor = "#3b82f6";
    
    if (percentage === 100) {
      statusMessage = "🏆 Completed! Great job!";
      statusColor = "#10b981";
    } else if (percentage >= 75) {
      statusMessage = "🔥 Almost there! Keep going!";
      statusColor = "#f59e0b";
    } else if (percentage >= 50) {
      statusMessage = "💪 Halfway through! You got this!";
      statusColor = "#8b5cf6";
    } else if (percentage >= 25) {
      statusMessage = "🚀 Good progress! Keep the momentum!";
      statusColor = "#3b82f6";
    } else if (percentage > 0) {
      statusMessage = "👋 Just getting started! Let's continue!";
      statusColor = "#6366f1";
    } else {
      statusMessage = "📚 Haven't started yet - begin today!";
      statusColor = "#64748b";
    }
    
    return `
      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0;">${enrollment.Course?.title || "Course"}</h3>
        <div style="background-color: #0f172a; border-radius: 8px; padding: 4px; margin-bottom: 12px;">
          <div style="background: linear-gradient(90deg, ${statusColor}, ${statusColor}AA); width: ${percentage}%; height: 8px; border-radius: 6px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8; font-size: 14px;">${percentage}% complete</span>
          <span style="color: ${statusColor}; font-size: 13px; font-weight: 500;">${statusMessage}</span>
        </div>
      </div>
    `;
  }).join("");
  
  const completedCount = enrollments.filter(e => (e.progress?.completionPercentage || 0) === 100).length;
  const inProgressCount = enrollments.filter(e => {
    const p = e.progress?.completionPercentage || 0;
    return p > 0 && p < 100;
  }).length;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monthly Learning Progress</title>
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
                <span style="font-size: 28px;">🎓</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Your Monthly Progress Report</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Hey ${student.first_name}, here's how you're doing!</p>
            </td>
          </tr>
          
          <!-- Stats -->
          <tr>
            <td>
              <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <div style="flex: 1; background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="color: #10b981; font-size: 24px; font-weight: 700; margin: 0;">${completedCount}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Completed</p>
                </div>
                <div style="flex: 1; background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="color: #3b82f6; font-size: 24px; font-weight: 700; margin: 0;">${inProgressCount}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">In Progress</p>
                </div>
                <div style="flex: 1; background-color: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="color: #8b5cf6; font-size: 24px; font-weight: 700; margin: 0;">${enrollments.length}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Total</p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Progress Cards -->
          <tr>
            <td>
              <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Your Courses</h2>
              ${progressCards}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 24px 0;">
              <a href="${process.env.CLIENT_URL}/enrollments" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Continue Learning →
              </a>
            </td>
          </tr>
          
          <!-- Motivational Message -->
          <tr>
            <td align="center">
              <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-top: 16px;">
                <p style="color: #fbbf24; font-size: 20px; margin: 0 0 8px 0;">💡</p>
                <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">
                  "The expert in anything was once a beginner." Keep learning, keep growing!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #475569; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Mentora</p>
              <p style="color: #475569; font-size: 11px; margin: 8px 0 0 0;">Happy Learning! 🚀</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendStudentProgressEmails = async () => {
  console.log("Starting student progress email job...");
  
  // Get all students with enrollments
  const students = await User.findAll({
    where: { role: "student", is_active: true, is_email_verified: true },
    attributes: ["id", "first_name", "last_name", "email"],
  });
  
  let sentCount = 0;
  let errorCount = 0;
  
  for (const student of students) {
    try {
      // Get student's enrollments with course info
      const enrollments = await Enrollment.findAll({
        where: { student_id: student.id },
        include: [
          {
            model: Course,
            attributes: ["id", "title", "thumbnail_url"],
          },
        ],
      });
      
      // Skip if no enrollments
      if (enrollments.length === 0) continue;
      
      const html = getStudentProgressEmailHtml(student, enrollments);
      
      await sendMail(
        student.email,
        "📊 Your Monthly Learning Progress Report - Mentora",
        html
      );
      
      sentCount++;
      console.log(`✉️ Sent progress email to ${student.email}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errorCount++;
      console.error(`Failed to send email to ${student.email}:`, error.message);
    }
  }
  
  console.log(`Student progress emails complete: ${sentCount} sent, ${errorCount} errors`);
  return { sentCount, errorCount };
};
