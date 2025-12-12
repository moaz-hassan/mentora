import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";
import { formatDistanceToNow } from "date-fns";

const API_URL = getApiBaseUrl();


export default async function getAdminStats() {
  try {
    const headers = getAuthHeaders();

    const [usersRes, coursesRes, pendingCoursesRes, reportsStatsRes] = await Promise.all([
      axios.get(`${API_URL}/api/users`, { headers }),
      axios.get(`${API_URL}/api/courses`), 
      axios.get(`${API_URL}/api/admin/courses/pending`, { headers }),
      axios.get(`${API_URL}/api/reports/stats`, { headers }),
    ]);

    const stats = {
      totalUsers: usersRes.data.success ? usersRes.data.count : 0,
      totalCourses: coursesRes.data.success ? coursesRes.data.count : 0,
      totalRevenue: 0, 
      pendingReviews: pendingCoursesRes.data.success ? pendingCoursesRes.data.count : 0,
      activeStudents: 0, 
      newEnrollments: 0, 
      openReports: reportsStatsRes.data.success ? reportsStatsRes.data.stats.pending : 0,
    };

    // Build recent activity from pending courses
    const recentActivity = [];
    
    if (pendingCoursesRes.data.success && pendingCoursesRes.data.data) {
      const pendingCourses = pendingCoursesRes.data.data.slice(0, 5);
      pendingCourses.forEach(course => {
        recentActivity.push({
          id: `course-${course.id}`,
          action: "New course submitted for review",
          course: course.title,
          instructor: course.Instructor ? `${course.Instructor.first_name} ${course.Instructor.last_name}` : "Unknown",
          time: course.created_at ? formatDistanceToNow(new Date(course.created_at), { addSuffix: true }) : "Recently",
        });
      });
    }

    return { success: true, data: stats, recentActivity };
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

