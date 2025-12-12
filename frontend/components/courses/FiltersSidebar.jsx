"use client";

import { Star, X } from "lucide-react";

export default function FiltersSidebar({
  categories = [],
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
  onClearAll,
  activeFiltersCount,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sticky top-8">
      {}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-white/80 hover:text-white flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Category
          </h4>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0 dark:bg-gray-700"
                />
                <span className="ml-2.5 text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Loading categories...</p>
            )}
          </div>
        </div>

        {}
        <div className="h-px bg-gray-100 dark:bg-gray-700" />

        {}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Price
          </h4>
          <div className="flex gap-2">
            {priceFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => togglePriceFilter(filter.value)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  selectedPriceFilters.includes(filter.value)
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="h-px bg-gray-100 dark:bg-gray-700" />

        {}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Difficulty Level
          </h4>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`py-1.5 px-3 text-xs font-medium rounded-full transition-all capitalize ${
                  selectedLevels.includes(level)
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="h-px bg-gray-100 dark:bg-gray-700" />

        {}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Minimum Rating
          </h4>
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <label
                key={rating}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="ml-2.5 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200 dark:text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">& up</span>
                </span>
              </label>
            ))}
            {selectedRating > 0 && (
              <button
                onClick={() => setSelectedRating(0)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1"
              >
                Clear rating filter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

