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
import classNames from "classnames"; // Import classNames

const HistoryTable = ({
  sortedHistory,
  sortConfig,
  requestSort,
  handleSeeFeedback,
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <div className="h-3 w-3"></div>; // Placeholder for alignment
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpIcon className="h-3 w-3 text-gray-500 dark:text-gray-400 ml-0.5" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-gray-500 dark:text-gray-400 ml-0.5" />
    );
  };

  const timePerQuestionText = (time) => {
    if (time === "0") {
      return "No time limit";
    } else {
      return `${time} min/Q`;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  const getIcon = (key) => {
    switch (key) {
      case "date":
        return (
          <CalendarIcon className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-1.5" />
        );
      case "category":
        return (
          <CpuChipIcon className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-1.5" />
        );
      case "time":
        return (
          <ClockIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1.5" />
        );
      case "score":
        return (
          <ChartPieIcon className="h-4 w-4 text-teal-500 dark:text-teal-400 mr-1.5" />
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

  const sortButtonClass =
    "font-semibold flex items-center justify-center p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs flex-shrink-0"; // Added flex-shrink-0

  return (
    <div className="max-h-[280px] md:max-h-[220px] overflow-y-auto pb-2">
      {" "}
      {/* Removed overflow-x-auto from here */}
      {/* Sorting Buttons Header - Responsive */}
      <div
        className={classNames(
          "mb-2 p-2 border-b border-gray-300 dark:border-gray-600",
          "flex flex-nowrap gap-2 overflow-x-auto justify-start", // Mobile: no wrap, horizontal scroll, start alignment
          "md:grid md:grid-cols-12 md:items-center md:gap-1 md:px-1 md:sticky md:top-0 md:bg-white md:dark:bg-dark-grey md:py-2 md:z-10" // Desktop: grid, sticky
        )}
      >
        <button
          className={classNames(
            sortButtonClass,
            "md:col-span-3 md:justify-start"
          )}
          onClick={() => requestSort("date")}
        >
          Date {getSortIcon("date")}
        </button>
        <button
          className={classNames(sortButtonClass, "md:col-span-3")}
          onClick={() => requestSort("category")}
        >
          Category {getSortIcon("category")}
        </button>
        <button
          className={classNames(sortButtonClass, "md:col-span-2")}
          onClick={() => requestSort("time")}
        >
          Time {getSortIcon("time")}
        </button>
        <button
          className={classNames(sortButtonClass, "md:col-span-2")}
          onClick={() => requestSort("percentage")}
        >
          Score {getSortIcon("percentage")}
        </button>
        <button
          className={classNames(
            sortButtonClass,
            "md:col-span-2 md:justify-end"
          )}
          onClick={() => requestSort("status")}
        >
          Status {getSortIcon("status")}
        </button>
      </div>
      {/* History Items - Container */}
      <div className="flex flex-col gap-3 md:gap-1 md:min-w-[700px] px-1 overflow-x-auto">
        {" "}
        {/* Added overflow-x-auto here for desktop table if needed */}
        {sortedHistory.map((result, index) => {
          const numQuestions = result.quizType === "interview" ? 15 : 10;
          const percentage = ((result.score / numQuestions) * 100).toFixed(0);
          const isPassed =
            result.quizType === "interview"
              ? percentage >= 66
              : percentage >= 80;

          return (
            <div
              key={result.id}
              className={classNames(
                "rounded-lg shadow-md",
                // Mobile Card Styling (default)
                "block p-3 bg-white dark:bg-gray-800",
                // Desktop Table Row Styling (md and up)
                "md:grid md:grid-cols-12 md:items-center md:p-1.5 md:min-h-[40px]",
                index % 2 === 0
                  ? "md:bg-gray-50 md:dark:bg-gray-700/50" // Alternating row for desktop
                  : "md:bg-white md:dark:bg-gray-800"
              )}
            >
              {/* --- Mobile Card Layout (Default, hidden on md and up) --- */}
              <div className="block md:hidden text-sm">
                {/* Date and Status Row */}
                <div className="flex justify-between items-baseline mb-1.5">
                  <div className="flex items-center">
                    {getIcon("date", result)}
                    <span className="font-medium">
                      {getText("date", result)}
                    </span>
                  </div>
                  {/* Status only */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isPassed
                        ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                        : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                    }`}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </span>
                </div>
                {/* Category Row */}
                <div className="flex items-center mb-1.5">
                  {getIcon("category", result)}
                  <span className="font-medium">
                    {getText("category", result)}
                  </span>
                </div>
                {/* Time Row */}
                <div className="flex items-center mb-1.5">
                  {getIcon("time", result)}
                  <span className="font-medium">{getText("time", result)}</span>
                </div>
                {/* Score Row */}
                <div className="flex items-center mb-2">
                  {" "}
                  {/* Added mb-2 to Score Row */}
                  {getIcon("score", result)}
                  <span className="font-medium">
                    {percentage}% ({result.score}/{numQuestions})
                  </span>
                </div>

                {/* Feedback Button (Moved Here) */}
                {result.quizType === "interview" && (
                  <div className="mt-2 flex justify-start items-center">
                    {" "}
                    {/* Changed to justify-start */}
                    <button
                      onClick={() => handleSeeFeedback(result)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-1 w-auto" // Adjusted padding and width
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />{" "}
                      {/* Adjusted icon size */}
                      Feedback
                    </button>
                  </div>
                )}
              </div>

              {/* --- Desktop Table Row Layout (Hidden by default, visible on md and up) --- */}
              {/* Date */}
              <div className="hidden md:flex md:col-span-3 items-center whitespace-nowrap pr-1 text-xs">
                {getIcon("date", result)}
                <span className="font-medium">{getText("date", result)}</span>
              </div>
              {/* Category */}
              <div className="hidden md:flex md:col-span-3 items-center whitespace-nowrap pr-1 text-xs">
                {getIcon("category", result)}
                <span className="font-medium">
                  {getText("category", result)}
                </span>
              </div>
              {/* Time */}
              <div className="hidden md:flex md:col-span-2 items-center justify-center whitespace-nowrap text-xs">
                {getIcon("time", result)}
                <span className="font-medium">{getText("time", result)}</span>
              </div>
              {/* Result */}
              <div className="hidden md:flex md:col-span-2 items-center justify-center pr-1 whitespace-nowrap text-xs">
                <div className="flex items-center">
                  <ChartPieIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1" />
                  <span className="font-medium">{percentage}%</span>
                </div>
              </div>
              {/* Status and See Feedback Button */}
              <div className="hidden md:flex md:col-span-2 items-center justify-end gap-1 whitespace-nowrap text-xs">
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
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTable;
