// src/components/HistoryTabs.js
import React from "react";
import classNames from "classnames"; // Import classNames

const HistoryTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      {" "}
      {/* Outer container can remain simple */}
      {/* This div acts as the tab bar itself, with a bottom border */}
      <div className="flex w-full border-b border-gray-300 dark:border-gray-600">
        <button
          onClick={() => setActiveTab("custom")}
          className={classNames(
            "w-1/2 py-3 px-4 focus:outline-none lg:py-4 lg:px-6 rounded-t-lg transition-colors duration-150",
            activeTab === "custom" // Active state
              ? "bg-white dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-500 lg:border-b-4 -mb-px" // -mb-px to overlap container border
              : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent"
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
            "w-1/2 py-3 px-4 focus:outline-none lg:py-4 lg:px-6 rounded-t-lg transition-colors duration-150",
            activeTab === "interview" // Active state
              ? "bg-white dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-500 lg:border-b-4 -mb-px" // -mb-px to overlap container border
              : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent"
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
