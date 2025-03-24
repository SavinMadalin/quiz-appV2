// src/components/HistoryTabs.js
import React from 'react';

const HistoryTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6 border-b border-gray-300 dark:border-gray-600">
      <div className="flex w-full">
        <button
          onClick={() => setActiveTab('custom')}
          className={`w-1/2 py-3 focus:outline-none ${activeTab === 'custom' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
        >
          <span className="block text-center">Custom Quizzes</span>
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`w-1/2 py-3 focus:outline-none ${activeTab === 'interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
        >
          <span className="block text-center">Interview Mode</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryTabs;
