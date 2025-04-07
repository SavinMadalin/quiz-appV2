// src/components/CategoryFilter.js
import React from "react";

const CategoryFilter = ({
  categories,
  selectedCategory,
  handleCategoryClick,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-1 justify-center">
      {/* Added justify-center */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-2 py-1 rounded-full text-xs ${
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
