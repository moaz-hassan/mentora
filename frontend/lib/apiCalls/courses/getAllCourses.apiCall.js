import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Search and filter courses with enhanced fuzzy search
 * @param {Object} params - Search and filter parameters
 * @param {string} params.search - Search query (supports fuzzy matching)
 * @param {Array<string>} params.categories - Category filters
 * @param {Array<string>} params.levels - Level filters
 * @param {Array<string>} params.priceFilters - Price filters (free/paid)
 * @param {number} params.rating - Minimum rating (1-5)
 * @param {string} params.sortBy - Sort option
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Response with courses and pagination
 */
export default async function searchCourses(params = {}) {
  try {
    const {
      search = "",
      categories = [],
      levels = [],
      priceFilters = [],
      rating = 0,
      language = "",
      sortBy = "popularity",
      page = 1,
      limit = 12,
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add search query
    if (search && search.trim()) {
      queryParams.append("search", search.trim());
    }

    // Add category filter
    if (categories.length > 0) {
      queryParams.append("category", categories[0]);
    }

    // Add level filter
    if (levels.length > 0) {
      queryParams.append("level", levels[0]);
    }

    // Add price filters (using new priceType parameter)
    if (priceFilters.length > 0) {
      if (priceFilters.includes("free") && !priceFilters.includes("paid")) {
        queryParams.append("priceType", "free");
      } else if (priceFilters.includes("paid") && !priceFilters.includes("free")) {
        queryParams.append("priceType", "paid");
      }
      // If both selected, don't add filter (show all)
    }

    // Add rating filter
    if (rating && rating > 0) {
      queryParams.append("rating", rating.toString());
    }

    // Add language filter
    if (language && language.trim()) {
      queryParams.append("language", language.trim());
    }

    // Map frontend sort values to backend values
    const sortMapping = {
      popularity: "popularity",
      rating: "rating",
      newest: "newest",
      relevance: "relevance",
      "price-low": "price_low_high",
      "price-high": "price_high_low",
    };
    queryParams.append("sortBy", sortMapping[sortBy] || "popularity");

    // Add pagination
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    // Make API request to search endpoint
    const response = await axios.get(
      `${API_URL}/api/courses/search?${queryParams.toString()}`
    );

    // Extract data from response format
    // Backend returns: { courses, page, perPage, totalPages, totalCount }
    const { courses, page: currentPage, perPage, totalPages, totalCount } = response.data;

    // Transform courses to match frontend expectations
    const transformedCourses = (courses || []).map((course) => ({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      instructor: course.instructor?.name || "Unknown Instructor",
      instructor_avatar: course.instructor?.avatar_url,
      category: course.category,
      level: course.level,
      price: parseFloat(course.price) || 0,
      rating: course.average_rating || 0,
      students: course.enrollment_count || 0,
      review_count: course.review_count || 0,
      thumbnail_url: course.thumbnail_url,
      badge: course.badge || null,
      have_discount: course.have_discount,
      discount_type: course.discount_type,
      discount_value: course.discount_value,
    }));

    return {
      success: true,
      data: {
        courses: transformedCourses,
        pagination: {
          total: totalCount,
          page: currentPage,
          limit: perPage,
          total_pages: totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Search courses error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message,
      error: error.message,
    };
  }
}
