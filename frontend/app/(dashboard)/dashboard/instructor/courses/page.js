"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search,
  Filter,
  Plus,
  Edit,
  BarChart3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";
import { toast } from "react-toastify";
import InstructorCoursesSkeleton from "@/components/skeleton/InstructorCoursesSkeleton";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      await fetchInstructorCourses();
    }
    fetchData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, statusFilter]);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllInstructorCourses();
      setCourses(response.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.status === statusFilter
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-700",
      },
      pending: {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-700",
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-700",
      },
      draft: {
        label: "Draft",
        color: "bg-gray-100 text-gray-700",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <InstructorCoursesSkeleton />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your course content
          </p>
        </div>
        <Link href="/dashboard/instructor/create-course">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {courses.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {courses.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {courses.filter((c) => c.status === "draft").length}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first course"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/dashboard/instructor/create-course">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No thumbnail
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description || "No description"}
                        </p>
                      </div>
                      {getStatusBadge(course.review_status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Category:</span>
                        {course.category || "Uncategorized"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Level:</span>
                        {course.level || "Not set"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Price:</span>$
                        {course.price || "0"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        href={`/dashboard/instructor/courses/${course.id}/edit`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Course
                        </Button>
                      </Link>

                      <Link
                        href={`/dashboard/instructor/analytics?courseId=${course.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>

                      <Link href={`/courses/${course.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
