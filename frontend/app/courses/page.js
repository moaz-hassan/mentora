"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import searchCourses from "@/lib/apiCalls/courses/getAllCourses.apiCall";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";
import SearchBar from "@/components/courses/SearchBar";
import FiltersSidebar from "@/components/courses/FiltersSidebar";
import CourseCard from "@/components/courses/CourseCard";
import Pagination from "@/components/courses/Pagination";
import { useCourseFilters } from "@/hooks/courses/useCourseFilters";
import MobileFilterDialog from "@/components/courses/MobileFilterDialog";
import Link from "next/link";
import { BookOpen, SlidersHorizontal, ChevronDown, ChevronRight, Home, Search } from "lucide-react";

const API_URL = getApiBaseUrl();

export default function CoursesSearchPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const coursesPerPage = 12;

  const priceFilters = [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
  ];

  const levels = ["beginner", "intermediate", "advanced"];
  const sortOptions = [
    { value: "popularity", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "relevance", label: "Most Relevant" },
  ];

  const {
    filters,
    setters,
    actions,
    activeFiltersCount
  } = useCourseFilters([], coursesPerPage);

  const {
    searchQuery,
    selectedCategories,
    selectedPriceFilters,
    selectedLevels,
    selectedRating,
    sortBy,
    currentPage
  } = filters;

  const {
    setSearchQuery,
    setSelectedRating,
    setSortBy,
    setCurrentPage
  } = setters;

  const {
    toggleCategory,
    togglePriceFilter,
    toggleLevel,
    clearAllFilters,
    handlePageChange
  } = actions;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (res.data.success) {
        setAllCategories(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, [
    selectedCategories,
    selectedPriceFilters,
    selectedLevels,
    selectedRating,
    sortBy,
    currentPage,
    searchQuery,
  ]);

  const fetchCourses = async (customQuery = null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await searchCourses({
        search: customQuery ?? searchQuery,
        categories: selectedCategories,
        levels: selectedLevels,
        priceFilters: selectedPriceFilters,
        rating: selectedRating,
        sortBy: sortBy,
        page: currentPage,
        limit: coursesPerPage,
      });

      if (result.success) {
        setCourses(result.data.courses);
        setTotalPages(result.data.pagination.total_pages);
        setTotalCourses(result.data.pagination.total);
      } else {
        setError(result.error || "Failed to load courses");
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = allCategories.find((c) => c.id === catId);
    return cat?.name || catId;
  };

  if (loading && courses.length === 0) {
    return <CoursesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-blue-300" />
            <span className="text-white bg-white/10 px-3 py-1 rounded-full text-xs border border-white/10 backdrop-blur-sm">
              Courses
            </span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-100 text-sm font-medium">
              {totalCourses} Courses Available
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Explore Our Courses
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Discover expert-led courses designed to help you master new skills.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <FiltersSidebar
              categories={allCategories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceFilters={priceFilters}
              selectedPriceFilters={selectedPriceFilters}
              togglePriceFilter={togglePriceFilter}
              levels={levels}
              selectedLevels={selectedLevels}
              toggleLevel={toggleLevel}
              selectedRating={selectedRating}
              setSelectedRating={(r) => {
                setSelectedRating(r);
                setCurrentPage(1);
              }}
              onClearAll={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          <div className="flex-1 min-w-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={() => setCurrentPage(1)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {totalCourses}
                  </span>{" "}
                  {totalCourses === 1 ? "course" : "courses"} found
                </p>

                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((catId) => (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                  >
                    {getCategoryName(catId)}
                    <button
                      onClick={() => toggleCategory(catId)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedLevels.map((lvl) => (
                  <span
                    key={lvl}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full capitalize"
                  >
                    {lvl}
                    <button
                      onClick={() => toggleLevel(lvl)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedPriceFilters.map((pf) => (
                  <span
                    key={pf}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full capitalize"
                  >
                    {pf}
                    <button
                      onClick={() => togglePriceFilter(pf)}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-yellow-50 text-yellow-700 rounded-full">
                    {selectedRating}+ Stars
                    <button
                      onClick={() => setSelectedRating(0)}
                      className="hover:text-yellow-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Error Loading Courses
                </h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!error && courses.length === 0 && !loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters.
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFilterDialog
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        priceFilters={priceFilters}
        selectedPriceFilters={selectedPriceFilters}
        togglePriceFilter={togglePriceFilter}
        levels={levels}
        selectedLevels={selectedLevels}
        toggleLevel={toggleLevel}
        selectedRating={selectedRating}
        setSelectedRating={(r) => {
          setSelectedRating(r);
          setCurrentPage(1);
        }}
        clearAllFilters={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}

function CoursesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-72 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-96 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-200 h-[600px] animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-14 bg-gray-100 rounded-xl animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  <div className="h-44 bg-gray-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
