import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function useCourseFilters(initialCategories = [], coursesPerPage = 12) {
  const searchParams = useSearchParams();
  
  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceFilters, setSelectedPriceFilters] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize from URL on mount
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchQuery(query);

    const categories = searchParams.get("categories");
    if (categories) setSelectedCategories(categories.split(","));

    const prices = searchParams.get("price");
    if (prices) setSelectedPriceFilters(prices.split(","));

    const levels = searchParams.get("level");
    if (levels) setSelectedLevels(levels.split(","));

    const rating = searchParams.get("rating");
    if (rating) setSelectedRating(Number(rating));

    const sort = searchParams.get("sort");
    if (sort) setSortBy(sort);

    const page = searchParams.get("page");
    if (page) setCurrentPage(Number(page));
  }, []);

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (selectedPriceFilters.length > 0) params.set("price", selectedPriceFilters.join(","));
    if (selectedLevels.length > 0) params.set("level", selectedLevels.join(","));
    if (selectedRating > 0) params.set("rating", selectedRating);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  }, [
    searchQuery,
    selectedCategories,
    selectedPriceFilters,
    selectedLevels,
    selectedRating,
    sortBy,
    currentPage
  ]);

  // Sync with URL whenever filters change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Handlers
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const togglePriceFilter = (filter) => {
    setSelectedPriceFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
    setCurrentPage(1);
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceFilters([]);
    setSelectedLevels([]);
    setSelectedRating(0);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const activeFiltersCount =
      selectedCategories.length +
      selectedPriceFilters.length +
      selectedLevels.length +
      (selectedRating > 0 ? 1 : 0);

  return {
    filters: {
      searchQuery,
      selectedCategories,
      selectedPriceFilters,
      selectedLevels,
      selectedRating,
      sortBy,
      currentPage,
    },
    setters: {
      setSearchQuery,
      setSelectedCategories,
      setSelectedPriceFilters,
      setSelectedLevels,
      setSelectedRating,
      setSortBy,
      setCurrentPage,
    },
    actions: {
      toggleCategory,
      togglePriceFilter,
      toggleLevel,
      clearAllFilters,
      handlePageChange,
    },
    activeFiltersCount,
  };
}
