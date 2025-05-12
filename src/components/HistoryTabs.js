// src/components/HistoryTabs.js
import React from "react";
import classNames from "classnames"; // Import classNames

const HistoryTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-300 dark:border-gray-600">
      <div className="flex w-full">
        <button
          onClick={() => setActiveTab("custom")}
          className={classNames(
            "w-1/2 py-3 px-4 focus:outline-none lg:py-4 lg:px-6", // Increased lg padding
            activeTab === "custom"
              ? "border-b-2 border-blue-500 text-blue-500 lg:border-b-4" // Thicker lg active border
              : "text-gray-700 dark:text-gray-300 lg:hover:bg-gray-200 lg:dark:hover:bg-gray-700" // LG hover for inactive
          )}
        >
          {/* Responsive text size, larger on lg */}
          <span className="block text-center text-sm sm:text-base lg:text-lg">
            Custom Mode
          </span>
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          className={classNames(
            "w-1/2 py-3 px-4 focus:outline-none lg:py-4 lg:px-6", // Increased lg padding
            activeTab === "interview"
              ? "border-b-2 border-blue-500 text-blue-500 lg:border-b-4" // Thicker lg active border
              : "text-gray-700 dark:text-gray-300 lg:hover:bg-gray-200 lg:dark:hover:bg-gray-700" // LG hover for inactive
          )}
        >
          {/* Responsive text size, larger on lg */}
          <span className="block text-center text-sm sm:text-base lg:text-lg">
            Interview Mode
          </span>
        </button>
      </div>
    </div>
  );
};

export default HistoryTabs;
