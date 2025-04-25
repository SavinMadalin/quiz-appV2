// src/components/CategoryFilter.js
import React from "react";

const CategoryFilter = ({
  categories,
  selectedCategory,
  handleCategoryClick,
}) => {
  return (
    // Reduced gap-1, mb-0.5
    <div className="flex flex-wrap gap-1 mb-0.5 justify-center p-1">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          // Reduced padding px-1.5 py-0.5, text-[10px] or text-xs
          className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
            selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
