"use client";

import { useState, useEffect } from "react";
import {
  Users, TrendingUp, BookOpen, Star, ArrowUpRight, ArrowDownRight,
  PlayCircle, FileText, MessageSquare, Clock, Award, Target,
  Activity, BarChart3, Download, CheckCircle, XCircle,
} from "lucide-react";
import { getInstructorAnalytics } from "@/lib/apiCalls/instructor/getAnalytics.apiCall";
import { getEnrollmentTrend } from "@/lib/apiCalls/analytics/getEnrollmentTrend.apiCall";

export default function InstructorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedCourse]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const courseId = selectedCourse === "all" ? null : selectedCourse;
      const analyticsResponse = await getInstructorAnalytics(courseId, parseInt(timeRange));
      const analyticsData = analyticsResponse.data;

      const enrollmentResponse = await getEnrollmentTrend(
        parseInt(timeRange),
        parseInt(timeRange) > 90 ? 'month' : parseInt(timeRange) > 30 ? 'week' : 'day'
      );
      const enrollmentTrendData = enrollmentResponse.data;

      setAnalytics(analyticsData);
      setEnrollmentData(enrollmentTrendData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data. Please try again.");
      setLoading(false);
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);
  const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Analytics</h1>
          <p className="mt-2 text-gray-600">Deep insights into your teaching performance</p>
        </div>
        <div className="flex gap-3">
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
            <option value="all">All Courses</option>
            {analytics.courses?.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview?.totalEnrollments || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">Across all courses</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Students</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview?.activeStudents || 0)}</p>
          <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg"><BookOpen className="w-6 h-6 text-purple-600" /></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.overview?.completionRate?.toFixed(1) || 0}%</p>
          <p className="text-sm text-gray-500 mt-2">Average across courses</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg"><Star className="w-6 h-6 text-yellow-600" /></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.overview?.averageRating?.toFixed(1) || "N/A"}</p>
          <p className="text-sm text-gray-500 mt-2">From student reviews</p>
        </div>
      </div>

      {/* Enrollment Trend Chart */}
      {enrollmentData?.enrollments?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enrollment Trend</h2>
              <p className="text-sm text-gray-600 mt-1">Student enrollments over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded"></div>
              <span className="text-gray-600">Enrollments</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-64 gap-2">
            {enrollmentData.enrollments.map((item, index) => {
              const maxEnrollments = Math.max(...enrollmentData.enrollments.map((e) => e.enrollments));
              const height = maxEnrollments > 0 ? (item.enrollments / maxEnrollments) * 100 : 0;
              const isPositive = index === 0 || item.enrollments >= enrollmentData.enrollments[index - 1].enrollments;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900 mb-1">{item.enrollments}</span>
                    {index > 0 && enrollmentData.enrollments[index - 1].enrollments > 0 && (
                      <span className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t hover:from-purple-700 hover:to-purple-500 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: "40px" }}
                    title={`${item.date}: ${item.enrollments} enrollments`}></div>
                  <span className="text-xs text-gray-600 mt-2 truncate max-w-full">
                    {item.date.length > 10 ? item.date.substring(5) : item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Performance Detailed */}
      {analytics.courses?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Performance Overview</h2>
          <div className="space-y-6">
            {analytics.courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(course.enrollments || 0)} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {course.averageRating?.toFixed(1) || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {course.completionRate?.toFixed(1) || 0}% completion
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Active Students</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(course.activeStudents || 0)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Avg Watch Time</p>
                    <p className="text-2xl font-bold text-green-600">{course.avgWatchTime || 0} min</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Quiz Avg Score</p>
                    <p className="text-2xl font-bold text-purple-600">{course.avgQuizScore?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Discussion Posts</p>
                    <p className="text-2xl font-bold text-orange-600">{formatNumber(course.discussionPosts || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Analytics */}
      {analytics.lessonAnalytics?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Lesson Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Lesson</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Views</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Completion Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Avg Watch Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {analytics.lessonAnalytics.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.courseName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{formatNumber(lesson.views || 0)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${lesson.completionRate || 0}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{lesson.completionRate?.toFixed(1) || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{lesson.avgWatchTime || 0} min</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lesson.engagement > 70 ? 'bg-green-100 text-green-700' :
                        lesson.engagement > 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {lesson.engagement?.toFixed(0) || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz Analytics Detailed */}
      {analytics.quizAnalytics?.quizzes?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Performance Analysis</h2>
          <div className="space-y-4">
            {analytics.quizAnalytics.quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{quiz.courseName} • {quiz.chapterName}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    quiz.passRate > 70 ? 'bg-green-100 text-green-700' :
                    quiz.passRate > 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {quiz.passRate?.toFixed(1) || 0}% pass rate
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Attempts</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(quiz.attempts || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Score</p>
                    <p className="text-lg font-bold text-purple-600">{quiz.avgScore?.toFixed(1) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Highest Score</p>
                    <p className="text-lg font-bold text-green-600">{quiz.highestScore || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Lowest Score</p>
                    <p className="text-lg font-bold text-red-600">{quiz.lowestScore || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Time</p>
                    <p className="text-lg font-bold text-blue-600">{quiz.avgTime || 0} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Engagement Chart */}
      {analytics.engagement?.dailyEngagement?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Daily Course Engagement</h2>
              <p className="text-sm text-gray-600 mt-1">Student activity across all courses</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-64 gap-2">
            {analytics.engagement.dailyEngagement.slice(-14).map((item, index) => {
              const maxEngagement = Math.max(...analytics.engagement.dailyEngagement.map((d) => d.activeStudents));
              const height = maxEngagement > 0 ? (item.activeStudents / maxEngagement) * 100 : 0;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-2">
                    <span className="text-xs font-semibold text-gray-900">{item.activeStudents}</span>
                  </div>
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t hover:from-green-700 hover:to-green-500 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: "30px" }}
                    title={`${item.date}: ${item.activeStudents} active students`}></div>
                  <span className="text-xs text-gray-600 mt-2 truncate max-w-full">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Progress Distribution */}
      {analytics.studentProgress && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Progress Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Not Started</p>
              <p className="text-3xl font-bold text-gray-400">{analytics.studentProgress.notStarted || 0}</p>
              <p className="text-xs text-gray-500 mt-1">0%</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Just Started</p>
              <p className="text-3xl font-bold text-red-600">{analytics.studentProgress.justStarted || 0}</p>
              <p className="text-xs text-gray-500 mt-1">1-25%</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{analytics.studentProgress.inProgress || 0}</p>
              <p className="text-xs text-gray-500 mt-1">26-75%</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Almost Done</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.studentProgress.almostDone || 0}</p>
              <p className="text-xs text-gray-500 mt-1">76-99%</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Completed</p>
              <p className="text-3xl font-bold text-green-600">{analytics.studentProgress.completed || 0}</p>
              <p className="text-xs text-gray-500 mt-1">100%</p>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      {analytics.engagement && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Engagement Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600">Chat Participation</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.engagement.chatParticipation?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">Students active in discussions</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">Avg Session Duration</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{analytics.engagement.averageSessionDuration || 0} min</p>
              <p className="text-xs text-gray-500 mt-1">Time spent per session</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">Quiz Performance</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{analytics.quizAnalytics?.averageScore?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">Average quiz score</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Overview */}
      {analytics.overview && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
              <p className="text-sm opacity-90 mb-2">Total Revenue</p>
              <p className="text-4xl font-bold">{formatCurrency(analytics.overview.totalRevenue || 0)}</p>
              <p className="text-sm opacity-75 mt-2">From {formatNumber(analytics.overview.totalEnrollments || 0)} enrollments</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Average Revenue per Student</p>
              <p className="text-4xl font-bold text-gray-900">
                {analytics.overview.totalEnrollments > 0
                  ? formatCurrency((analytics.overview.totalRevenue || 0) / analytics.overview.totalEnrollments)
                  : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Across all courses</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Revenue Growth</p>
              <p className="text-4xl font-bold text-green-600">+{analytics.overview.revenueGrowth?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-500 mt-2">vs previous period</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Performance Insights & Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Strong Points</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• {analytics.overview?.activeStudents || 0} students active in last 30 days</li>
                  <li>• Average completion rate of {analytics.overview?.completionRate?.toFixed(1) || 0}%</li>
                  {analytics.quizAnalytics?.averageScore > 70 && (
                    <li>• Excellent quiz performance at {analytics.quizAnalytics.averageScore.toFixed(1)}%</li>
                  )}
                  {analytics.engagement?.chatParticipation > 50 && (
                    <li>• High chat participation at {analytics.engagement.chatParticipation.toFixed(1)}%</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Areas for Improvement</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {analytics.overview?.completionRate < 50 && (
                    <li>• Consider breaking down complex lessons into smaller segments</li>
                  )}
                  {analytics.quizAnalytics?.averageScore < 60 && (
                    <li>• Quiz difficulty may need adjustment or more practice materials</li>
                  )}
                  {analytics.engagement?.chatParticipation < 30 && (
                    <li>• Encourage more discussion with prompts and questions</li>
                  )}
                  {analytics.studentProgress?.notStarted > analytics.studentProgress?.completed && (
                    <li>• Many students haven't started - consider sending reminders</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
