import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


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

    
    const queryParams = new URLSearchParams();

    
    if (search && search.trim()) {
      queryParams.append("search", search.trim());
    }

    
    if (categories.length > 0) {
      queryParams.append("category", categories[0]);
    }

    
    if (levels.length > 0) {
      queryParams.append("level", levels[0]);
    }

    
    if (priceFilters.length > 0) {
      if (priceFilters.includes("free") && !priceFilters.includes("paid")) {
        queryParams.append("priceType", "free");
      } else if (priceFilters.includes("paid") && !priceFilters.includes("free")) {
        queryParams.append("priceType", "paid");
      }
      
    }

    
    if (rating && rating > 0) {
      queryParams.append("rating", rating.toString());
    }

    
    if (language && language.trim()) {
      queryParams.append("language", language.trim());
    }

    
    const sortMapping = {
      popularity: "popularity",
      rating: "rating",
      newest: "newest",
      relevance: "relevance",
      "price-low": "price_low_high",
      "price-high": "price_high_low",
    };
    queryParams.append("sortBy", sortMapping[sortBy] || "popularity");

    
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    
    const response = await axios.get(
      `${API_URL}/api/courses/search?${queryParams.toString()}`
    );

    
    
    const { courses, page: currentPage, perPage, totalPages, totalCount } = response.data;

    
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
