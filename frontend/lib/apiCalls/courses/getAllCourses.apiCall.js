import axios from "axios";

export default async function searchCourses(params = {}) {
  try {
    const {
      search = "",
      categories = [],
      levels = [],
      priceFilters = [],
      sortBy = "popularity",
      page = 1,
      limit = 6,
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add search query
    if (search && search.trim()) {
      queryParams.append("search", search.trim());
    }

    // Add category filter (backend expects single category or comma-separated)
    if (categories.length > 0) {
      queryParams.append("category", categories[0]); // Backend currently supports single category
    }

    // Add level filter (backend expects single level or comma-separated)
    if (levels.length > 0) {
      queryParams.append("level", levels[0]); // Backend currently supports single level
    }

    // Add price filters
    if (priceFilters.length > 0) {
      if (priceFilters.includes("free") && !priceFilters.includes("paid")) {
        // Only free courses
        queryParams.append("minPrice", "0");
        queryParams.append("maxPrice", "0");
      } else if (priceFilters.includes("paid") && !priceFilters.includes("free")) {
        // Only paid courses
        queryParams.append("minPrice", "0.01");
      }
      // If both selected, don't add price filters (show all)
    }

    // Map frontend sort values to backend values
    const sortMapping = {
      popularity: "popularity",
      rating: "rating",
      newest: "newest",
      "price-low": "price_low_high",
      "price-high": "price_high_low",
    };
    queryParams.append("sortBy", sortMapping[sortBy] || "popularity");

    // Add pagination
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    // Make API request
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses?${queryParams.toString()}`
    );

    // Extract data from response
    const { data, pagination } = response.data;

    // Transform courses to match frontend expectations
    const transformedCourses = data.map((course) => ({
      id: course.id,
      title: course.title,
      instructor: course.User
        ? `${course.User.first_name} ${course.User.last_name}`
        : "Unknown Instructor",
      category: course.category,
      level: S,
      price: parseFloat(course.price) || 0,
      rating: course.average_rating ? parseFloat(course.average_rating) : 0,
      students: course.enrollment_count || 0,
      thumbnail_url: course.thumbnail_url,
      badge: course.badge || null,
      is_published: course.is_published,
    }));

    return {
      courses: transformedCourses,
      pagination: pagination || {
        total: transformedCourses.length,
        page: page,
        limit: limit,
        total_pages: 1,
      },
    };
  } catch (error) {
    console.error("Error searching courses:", error);

    // Handle different error types
    if (error.code === "ERR_NETWORK" || error.message.includes("network")) {
      const networkError = new Error(
        "Network error. Please check your connection and try again."
      );
      networkError.isNetworkError = true;
      throw networkError;
    }

    if (error.response) {
      // Server responded with error
      const statusCode = error.response.status;
      if (statusCode >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (statusCode >= 400) {
        throw new Error(
          error.response.data?.message || "Failed to fetch courses."
        );
      }
    }

    // Generic error
    throw new Error("Failed to load courses. Please try again.");
  }
}
