/**
 * Fetch all subcategories or subcategories by category ID
 * @param {string|null} categoryId - Optional category ID to filter subcategories
 * @returns {Promise<Object>} Response with subcategories array
 */
export const getSubCategories = async (categoryId = null) => {
  try {
    const url = categoryId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}/subcategories`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/subcategories`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch subcategories");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};
