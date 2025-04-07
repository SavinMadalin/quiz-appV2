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
      <ArrowUpIcon className="h-4 w-4 text-gray-500 ml-0.5" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-gray-500 ml-0.5" />
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

  const getIcon = (key, result) => {
    switch (key) {
      case "date":
        return (
          <CalendarIcon className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-1" />
        );
      case "category":
        return (
          <CpuChipIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-1" />
        );
      case "time":
        return (
          <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-1" />
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
    <>
      {/* History List Box */}
      <div className="mb-4 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 max-h-[250px] overflow-y-auto">
        {/* Horizontal Scrollable Container */}
        <div className="overflow-x-auto">
          {/* Inner Container for Card Content */}
          <div className="flex flex-col gap-2 mt-2 min-w-[900px]">
            {/* Sorting Buttons */}
            <div className="grid grid-cols-12 w-full items-center mb-2 text-sm flex-nowrap gap-2">
              <button
                className="col-span-3 font-semibold flex items-center justify-left pr-5"
                onClick={() => requestSort("date")}
              >
                <span className="">Date</span> {getSortIcon("date")}
              </button>
              <button
                className="col-span-3 font-semibold flex items-center"
                onClick={() => requestSort("category")}
              >
                <span className="">Category</span> {getSortIcon("category")}
              </button>
              <button
                className="col-span-1 font-semibold flex items-center justify-center"
                onClick={() => requestSort("time")}
              >
                <span className="">Time</span> {getSortIcon("time")}
              </button>
              <button
                className="col-span-4 font-semibold flex items-center justify-center pr-2"
                onClick={() => requestSort("percentage")}
              >
                <span className="">Percentage</span> {getSortIcon("percentage")}
              </button>
              <button
                className="col-span-0 font-semibold flex items-center justify-end pr-2"
                onClick={() => requestSort("status")}
              >
                <span className="">Status</span> {getSortIcon("status")}
              </button>
            </div>
            {sortedHistory.map((result, index) => {
              const numQuestions = result.quizType === "interview" ? 15 : 10;
              const percentage = ((result.score / numQuestions) * 100).toFixed(
                0
              );
              const isPassed =
                result.quizType === "interview"
                  ? percentage >= 66
                  : percentage >= 80;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={result.id}
                  className={`bg-white dark:bg-gray-700 p-0 rounded-lg shadow-md ${
                    isEven
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "bg-gray-100 dark:bg-gray-800"
                  } min-h-[50px]`}
                >
                  <div className="grid grid-cols-12 w-full items-center flex-nowrap mt-3">
                    {/* Date */}
                    <div className="col-span-3 flex items-center whitespace-nowrap">
                      {getIcon("date", result)}
                      <span className="font-medium text-xs">
                        {getText("date", result)}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="col-span-3 flex items-center whitespace-nowrap">
                      {getIcon("category", result)}
                      <span className="font-medium text-xs">
                        {getText("category", result)}
                      </span>
                    </div>

                    {/* Time Per Question */}
                    <div className="col-span-2 flex items-center whitespace-nowrap">
                      {getIcon("time", result)}
                      <span className="font-medium text-xs">
                        {getText("time", result)}
                      </span>
                    </div>

                    {/* Result and status */}
                    <div className="col-span-2 flex items-center justify-center pr-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <ChartPieIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-1" />
                        <span className="font-medium text-xs">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Status and See Feedback Button */}
                    <div className="col-span-2 flex items-center justify-end pl-1 gap-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryTable;
