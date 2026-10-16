import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function useCourseFilters(initialCategories = [], coursesPerPage = 12) {
  const searchParams = useSearchParams();
  
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceFilters, setSelectedPriceFilters] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [language, setLanguage] = useState(searchParams.get("language") || "");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);

  
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchQuery(query);

    const categories = searchParams.get("categories");
    if (categories) setSelectedCategories(categories.split(","));

    const prices = searchParams.get("price");
    if (prices) setSelectedPriceFilters(prices.split(","));

    const minP = searchParams.get("minPrice");
    if (minP) setMinPrice(Number(minP));

    const maxP = searchParams.get("maxPrice");
    if (maxP) setMaxPrice(Number(maxP));

    const lang = searchParams.get("language");
    if (lang) setLanguage(lang);

    const levels = searchParams.get("level");
    if (levels) setSelectedLevels(levels.split(","));

    const rating = searchParams.get("rating");
    if (rating) setSelectedRating(Number(rating));

    const sort = searchParams.get("sort");
    if (sort) setSortBy(sort);

    const page = searchParams.get("page");
    if (page) setCurrentPage(Number(page));
  }, []);

  
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (selectedPriceFilters.length > 0) params.set("price", selectedPriceFilters.join(","));
    if (selectedLevels.length > 0) params.set("level", selectedLevels.join(","));
    if (selectedRating > 0) params.set("rating", selectedRating);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage);
    if (minPrice && minPrice > 0) params.set("minPrice", minPrice);
    if (maxPrice && maxPrice > 0) params.set("maxPrice", maxPrice);
    if (language && language.trim()) params.set("language", language.trim());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  }, [
    searchQuery,
    selectedCategories,
    selectedPriceFilters,
    selectedLevels,
    selectedRating,
    sortBy,
    currentPage,
    minPrice,
    maxPrice,
    language
  ]);

  
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  
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
      ((minPrice && minPrice > 0) || (maxPrice && maxPrice > 0) ? 1 : 0) +
      selectedLevels.length +
      (selectedRating > 0 ? 1 : 0);

  return {
    filters: {
      searchQuery,
      selectedCategories,
      selectedPriceFilters,
      minPrice,
      maxPrice,
      language,
      selectedLevels,
      selectedRating,
      sortBy,
      currentPage,
    },
    setters: {
      setSearchQuery,
      setSelectedCategories,
      setSelectedPriceFilters,
      setMinPrice,
      setMaxPrice,
      setLanguage,
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
