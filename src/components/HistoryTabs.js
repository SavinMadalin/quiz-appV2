// src/components/HistoryTabs.js
import React from "react";

const HistoryTabs = ({ activeTab, setActiveTab }) => {
  return (
    // Removed mb-6, border is kept
    <div className="border-b border-gray-300 dark:border-gray-600">
      <div className="flex w-full">
        <button
          onClick={() => setActiveTab("custom")}
          // Added px-4 for horizontal padding
          className={`w-1/2 py-3 px-4 focus:outline-none ${
            activeTab === "custom"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <span className="block text-center">Custom Mode</span>
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          // Added px-4 for horizontal padding
          className={`w-1/2 py-3 px-4 focus:outline-none ${
            activeTab === "interview"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <span className="block text-center">Interview Mode</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryTabs;
