// src/components/HistoryTable.js
import React from "react";
import {
  CalendarIcon,
  ChartPieIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const HistoryTable = ({
  sortedHistory,
  sortConfig,
  requestSort,
  handleSeeFeedback,
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpIcon className="h-3 w-3 text-gray-500 ml-0.5" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-gray-500 ml-0.5" />
    );
  };

  const timePerQuestionText = (time) => {
    if (time === "0") {
      return "No time";
    } else {
      return `${time} min/Q`;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getIcon = (key) => {
    switch (key) {
      case "date":
        return (
          <CalendarIcon className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-1" />
        );
      case "category":
        return (
          <CpuChipIcon className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-1" />
        );
      case "time":
        return (
          <ClockIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1" />
        );
      default:
        return null;
    }
  };

  const getText = (key, result) => {
    switch (key) {
      case "date":
        return new Date(result.timestamp.seconds * 1000).toLocaleDateString();
      case "category":
        return result.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      case "time":
        return result.quizType === "interview"
          ? formatTime(result.timeTaken)
          : timePerQuestionText(
              result.timePerQuestion !== undefined
                ? result.timePerQuestion
                : "0"
            );
      default:
        return null;
    }
  };

  return (
    // Combine vertical and horizontal scrolling on this outer div
    // Added pb-2 (padding-bottom) to prevent scrollbar overlap
    <div className="max-h-[220px] overflow-y-auto overflow-x-scroll pb-2">
      {/* Container for the actual content (header + rows) */}
      {/* This div no longer needs overflow-x-scroll */}
      <div className="flex flex-col gap-1 min-w-[700px]">
        {/* Sorting Buttons Header - Should stick to the top of the scroll container */}
        {/* Ensure background color covers content scrolling underneath */}
        <div className="grid grid-cols-12 w-full items-center mb-1 text-xs flex-nowrap gap-1 px-1 sticky top-0 bg-white dark:bg-dark-grey py-2 z-10 border-b border-gray-300 dark:border-gray-600">
          {/* Sorting Buttons */}
          <button
            className="col-span-3 font-semibold flex items-center justify-start pr-2"
            onClick={() => requestSort("date")}
          >
            <span className="">Date</span> {getSortIcon("date")}
          </button>
          <button
            className="col-span-3 font-semibold flex items-center pr-1"
            onClick={() => requestSort("category")}
          >
            <span className="">Category</span> {getSortIcon("category")}
          </button>
          {/* Added pl-2 to the Time header button */}
          <button
            className="col-span-2 font-semibold flex items-center justify-center pr-6 "
            onClick={() => requestSort("time")}
          >
            <span className="">Time</span> {getSortIcon("time")}
          </button>
          <button
            className="col-span-2 font-semibold flex items-center justify-center pr-1"
            onClick={() => requestSort("percentage")}
          >
            <span className="">Score</span> {getSortIcon("percentage")}
          </button>
          <button
            className="col-span-2 font-semibold flex items-center justify-end"
            onClick={() => requestSort("status")}
          >
            <span className="">Status</span> {getSortIcon("status")}
          </button>
        </div>

        {/* History Rows */}
        {sortedHistory.map((result, index) => {
          const numQuestions = result.quizType === "interview" ? 15 : 10;
          const percentage = ((result.score / numQuestions) * 100).toFixed(0);
          const isPassed =
            result.quizType === "interview"
              ? percentage >= 66
              : percentage >= 80;
          const isEven = index % 2 === 0;

          return (
            <div
              key={result.id}
              className={`p-1.5 rounded-md shadow-sm ${
                isEven
                  ? "bg-gray-50 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              } min-h-[40px]`}
            >
              <div className="grid grid-cols-12 w-full items-center flex-nowrap mt-0 text-xs">
                {/* Date */}
                <div className="col-span-3 flex items-center whitespace-nowrap pr-1">
                  {getIcon("date", result)}
                  <span className="font-medium">{getText("date", result)}</span>
                </div>

                {/* Category */}
                <div className="col-span-3 flex items-center whitespace-nowrap pr-1">
                  {getIcon("category", result)}
                  <span className="font-medium">
                    {getText("category", result)}
                  </span>
                </div>

                {/* Time Per Question - Added pl-2 */}
                <div className="col-span-2 flex items-center whitespace-nowrap pl-3 lg:pl-7">
                  {getIcon("time", result)}
                  <span className="font-medium">{getText("time", result)}</span>
                </div>

                {/* Result */}
                <div className="col-span-2 flex items-center justify-center pr-1 whitespace-nowrap">
                  <div className="flex items-center">
                    <ChartPieIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1" />
                    <span className="font-medium">{percentage}%</span>
                  </div>
                </div>

                {/* Status and See Feedback Button */}
                <div className="col-span-2 flex items-center justify-end gap-1 whitespace-nowrap">
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isPassed
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </span>
                  {result.quizType === "interview" && (
                    <button
                      onClick={() => handleSeeFeedback(result)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-xs flex items-center gap-0.5"
                    >
                      <ChatBubbleLeftRightIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div> // Outer div closing tag
  );
};

export default HistoryTable;
