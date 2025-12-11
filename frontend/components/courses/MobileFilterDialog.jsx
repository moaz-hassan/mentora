import React from "react";
import FiltersSidebar from "@/components/courses/FiltersSidebar";

export default function MobileFilterDialog({
  isOpen,
  onClose,
  allCategories,
  selectedCategories,
  toggleCategory,
  priceFilters,
  selectedPriceFilters,
  togglePriceFilter,
  levels,
  selectedLevels,
  toggleLevel,
  selectedRating,
  setSelectedRating,
  clearAllFilters,
  activeFiltersCount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-4">
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
            setSelectedRating={setSelectedRating}
            onClearAll={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>
    </div>
  );
}
